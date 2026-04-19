const express = require("express");
const chatRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const { fetchRepoMetadata } = require("../utils/repoParser");

const USER_SAFE_DATA = "firstName lastName photoUrl about skills githubUsername githubProfileUrl";

// Get all chat rooms for logged-in user
chatRouter.get("/chat/rooms", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await ChatRoom.find({
      participants: userId,
    })
      .populate("participants", USER_SAFE_DATA)
      .sort({ updatedAt: -1 });

    // For each room, get unread count
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = await Message.countDocuments({
          chatRoomId: room._id,
          senderId: { $ne: userId },
          status: { $ne: "read" },
        });
        return { ...room.toObject(), unreadCount };
      })
    );

    res.json({ data: roomsWithUnread });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get or create chat room between logged-in user and target user
chatRouter.get("/chat/room/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (userId.equals(targetUserId)) {
      throw new Error("Cannot chat with yourself");
    }

    // Verify they are connected
    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
        { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
      ],
    });

    if (!connection) {
      throw new Error("You can only chat with connected users");
    }

    // Find existing room or create one
    let room = await ChatRoom.findOne({
      participants: { $all: [userId, targetUserId], $size: 2 },
    }).populate("participants", USER_SAFE_DATA);

    if (!room) {
      room = await ChatRoom.create({
        participants: [userId, targetUserId],
      });
      room = await ChatRoom.findById(room._id).populate(
        "participants",
        USER_SAFE_DATA
      );
    }

    res.json({ data: room });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Paginated message history
chatRouter.get("/chat/messages/:chatRoomId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatRoomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    // Verify user is a participant
    const room = await ChatRoom.findById(chatRoomId);
    if (!room || !room.participants.some((p) => p.equals(userId))) {
      throw new Error("Unauthorized: You are not a participant");
    }

    const messages = await Message.find({ chatRoomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "firstName lastName photoUrl");

    const total = await Message.countDocuments({ chatRoomId });

    res.json({
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mark messages as read
chatRouter.patch("/chat/messages/read/:chatRoomId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatRoomId } = req.params;

    const room = await ChatRoom.findById(chatRoomId);
    if (!room || !room.participants.some((p) => p.equals(userId))) {
      throw new Error("Unauthorized");
    }

    const now = new Date();
    await Message.updateMany(
      {
        chatRoomId,
        senderId: { $ne: userId },
        status: { $ne: "read" },
      },
      { $set: { status: "read", readAt: now } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get shared resources for a chat room
chatRouter.get("/chat/room/:chatRoomId/resources", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatRoomId } = req.params;

    const room = await ChatRoom.findById(chatRoomId).populate(
      "sharedResources.sharedBy",
      "firstName lastName"
    );
    if (!room || !room.participants.some((p) => p.equals(userId))) {
      throw new Error("Unauthorized");
    }

    res.json({ data: room.sharedResources || [] });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Proxy GitHub repo metadata fetch
chatRouter.get("/chat/github/repo/:owner/:repo", userAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    if (!/^[a-zA-Z0-9\-_.]+$/.test(owner) || !/^[a-zA-Z0-9\-_.]+$/.test(repo)) {
      throw new Error("Invalid owner or repo name");
    }

    const metadata = await fetchRepoMetadata(owner, repo);
    res.json({ data: metadata });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = chatRouter;
