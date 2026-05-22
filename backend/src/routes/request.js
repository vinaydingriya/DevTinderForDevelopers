const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;

      const status = req.params.status;

      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ error: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ error: "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
        isSuperLike: req.body.isSuperLike === true,
      });

      const data = await connectionRequest.save();

      // Emit real-time notification to target user
      if (status === "interested") {
        const io = req.app.get("io");
        if (io) {
          io.to(toUserId).emit("notification", {
            type: "connection_request",
            message: `${req.user.firstName} wants to connect with you!`,
            fromUser: {
              _id: req.user._id,
              firstName: req.user.firstName,
              lastName: req.user.lastName,
              photoUrl: req.user.photoUrl,
            },
            requestId: data._id,
            createdAt: new Date(),
          });
        }
      }

      res.json({
        message:
          req.user.firstName + " is " + (status === 'interested' ? status : 'not ' + status) + " in connecting with " + toUser.firstName,
        data,
      });
    } catch (e) {
      res.status(400).json({error: e.message});
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ error: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      // Emit real-time notification to the original sender
      const io = req.app.get("io");
      if (io) {
        const fromUserId = connectionRequest.fromUserId.toString();
        io.to(fromUserId).emit("notification", {
          type: status === "accepted" ? "request_accepted" : "request_rejected",
          message: status === "accepted"
            ? `${loggedInUser.firstName} accepted your connection request! 🎉`
            : `${loggedInUser.firstName} declined your connection request`,
          fromUser: {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            photoUrl: loggedInUser.photoUrl,
          },
          createdAt: new Date(),
        });
      }

      res.json({ message: "Connection request " + status, data });
    } catch (e) {
      res.status(400).json({error: e.message});
    }
  }
);

requestRouter.delete(
  "/connection/remove/:connectionUserId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { connectionUserId } = req.params;

      // Find the accepted connection request
      const connection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: loggedInUser._id, toUserId: connectionUserId, status: "accepted" },
          { fromUserId: connectionUserId, toUserId: loggedInUser._id, status: "accepted" },
        ],
      });

      if (!connection) {
        return res.status(404).json({ error: "Connection not found or already removed" });
      }

      // Delete the connection document
      await ConnectionRequest.deleteOne({ _id: connection._id });

      // Find and delete the chat room between these users
      const chatRoom = await ChatRoom.findOne({
        participants: { $all: [loggedInUser._id, connectionUserId], $size: 2 },
      });

      if (chatRoom) {
        // Delete all messages in the chat room
        await Message.deleteMany({ chatRoomId: chatRoom._id });
        // Delete the room itself
        await ChatRoom.deleteOne({ _id: chatRoom._id });

        // Emit socket notification to participants about chat room deletion
        const io = req.app.get("io");
        if (io) {
          io.to(chatRoom._id.toString()).emit("chat_deleted", { chatRoomId: chatRoom._id });
        }
      }

      // Emit real-time notification to the removed connection user
      const io = req.app.get("io");
      if (io) {
        io.to(connectionUserId).emit("notification", {
          type: "connection_removed",
          message: `${loggedInUser.firstName} removed the connection.`,
          fromUser: {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            photoUrl: loggedInUser.photoUrl,
          },
          createdAt: new Date(),
        });
      }

      res.json({ message: "Connection removed successfully" });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

module.exports = requestRouter;
