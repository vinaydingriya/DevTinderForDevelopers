const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
const { parseRepoReferences, fetchRepoMetadata, sanitizeMessageText } = require("../utils/repoParser");

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map();

function initializeSocket(io) {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Join personal room so this user receives messages globally
    // (even when not viewing a specific chat)
    socket.join(userId);

    // Track user as online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status to all connected users
    io.emit("presence_update", { userId, isOnline: true });

    // Send current online users list to the connecting client
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineList);

    // Join room
    socket.on("join_room", async (data) => {
      try {
        const { chatRoomId } = data;
        if (!chatRoomId) return;

        const room = await ChatRoom.findById(chatRoomId);
        if (!room || !room.participants.some((p) => p.equals(userId))) {
          socket.emit("error", { message: "Unauthorized to join this room" });
          return;
        }

        socket.join(chatRoomId);
        socket.emit("room_joined", { chatRoomId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Leave room
    socket.on("leave_room", (data) => {
      if (data?.chatRoomId) {
        socket.leave(data.chatRoomId);
      }
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { chatRoomId, text, clientMessageId } = data;

        if (!chatRoomId || !text || !text.trim()) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        // Verify room access
        const room = await ChatRoom.findById(chatRoomId);
        if (!room || !room.participants.some((p) => p.equals(userId))) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        // Duplicate prevention
        if (clientMessageId) {
          const existing = await Message.findOne({ clientMessageId });
          if (existing) {
            socket.emit("receive_message", existing.toObject());
            return;
          }
        }

        const sanitizedText = sanitizeMessageText(text);
        const repoRefs = parseRepoReferences(text);

        // Fetch metadata for each repo reference
        const enrichedRefs = await Promise.all(
          repoRefs.map(async (ref) => {
            const metadata = await fetchRepoMetadata(ref.owner, ref.repoName);
            return { ...ref, metadata };
          })
        );

        // Save message to DB
        const message = await Message.create({
          chatRoomId,
          senderId: userId,
          text: sanitizedText,
          clientMessageId,
          repoReferences: enrichedRefs,
          status: "sent",
        });

        // Update last message in room
        await ChatRoom.findByIdAndUpdate(chatRoomId, {
          lastMessage: {
            text: sanitizedText.substring(0, 100),
            senderId: userId,
            createdAt: message.createdAt,
          },
        });

        // Add shared resources to room
        if (enrichedRefs.length > 0) {
          const resources = enrichedRefs.map((ref) => ({
            type: ref.filePath ? "file" : "repo",
            owner: ref.owner,
            repoName: ref.repoName,
            filePath: ref.filePath,
            url: ref.metadata.url,
            metadata: {
              description: ref.metadata.description,
              stars: ref.metadata.stars,
              language: ref.metadata.language,
            },
            sharedBy: userId,
            sharedAt: new Date(),
          }));

          await ChatRoom.findByIdAndUpdate(chatRoomId, {
            $push: { sharedResources: { $each: resources } },
          });
        }

        // Populate sender info
        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "firstName lastName photoUrl"
        );

        // Emit to the chatRoom (for users who have the chat open)
        io.to(chatRoomId).emit("receive_message", populatedMessage.toObject());

        // Also emit a notification to the receiver's personal room
        // so they get it even if they're on a different page / different chat
        const recipientIdForNotif = room.participants
          .find((p) => !p.equals(userId))
          ?.toString();
        if (recipientIdForNotif) {
          io.to(recipientIdForNotif).emit("new_message_notification", {
            ...populatedMessage.toObject(),
            chatRoomId,
          });
        }

        // Check if recipient is online and mark as delivered
        const recipientId = room.participants
          .find((p) => !p.equals(userId))
          ?.toString();

        if (recipientId && onlineUsers.has(recipientId)) {
          await Message.findByIdAndUpdate(message._id, {
            status: "delivered",
            deliveredAt: new Date(),
          });
          socket.emit("message_delivered", {
            messageId: message._id,
            deliveredAt: new Date(),
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      if (data?.chatRoomId) {
        socket.to(data.chatRoomId).emit("typing", {
          userId,
          chatRoomId: data.chatRoomId,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      if (data?.chatRoomId) {
        socket.to(data.chatRoomId).emit("stop_typing", {
          userId,
          chatRoomId: data.chatRoomId,
        });
      }
    });

    // Message delivered acknowledgment
    socket.on("message_delivered", async (data) => {
      try {
        const { messageId } = data;
        if (!messageId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        // Only the recipient can mark as delivered
        if (message.senderId.equals(userId)) return;

        await Message.findByIdAndUpdate(messageId, {
          status: "delivered",
          deliveredAt: new Date(),
        });

        const senderId = message.senderId.toString();
        if (onlineUsers.has(senderId)) {
          const senderSockets = onlineUsers.get(senderId);
          senderSockets.forEach((sid) => {
            io.to(sid).emit("message_delivered", {
              messageId,
              deliveredAt: new Date(),
            });
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Message read acknowledgment
    socket.on("message_read", async (data) => {
      try {
        const { messageId, chatRoomId } = data;

        if (chatRoomId) {
          // Mark all messages in room as read
          const now = new Date();
          const updated = await Message.updateMany(
            {
              chatRoomId,
              senderId: { $ne: userId },
              status: { $ne: "read" },
            },
            { status: "read", readAt: now }
          );

          if (updated.modifiedCount > 0) {
            // Notify sender(s)
            const room = await ChatRoom.findById(chatRoomId);
            if (room) {
              const otherUserId = room.participants
                .find((p) => !p.equals(userId))
                ?.toString();
              if (otherUserId && onlineUsers.has(otherUserId)) {
                const sockets = onlineUsers.get(otherUserId);
                sockets.forEach((sid) => {
                  io.to(sid).emit("messages_read", { chatRoomId, readAt: now });
                });
              }
            }
          }
        } else if (messageId) {
          const message = await Message.findById(messageId);
          if (!message || message.senderId.equals(userId)) return;

          await Message.findByIdAndUpdate(messageId, {
            status: "read",
            readAt: new Date(),
          });

          const senderId = message.senderId.toString();
          if (onlineUsers.has(senderId)) {
            const senderSockets = onlineUsers.get(senderId);
            senderSockets.forEach((sid) => {
              io.to(sid).emit("message_read", {
                messageId,
                readAt: new Date(),
              });
            });
          }
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Reconnect sync - get messages since a timestamp
    socket.on("reconnect_sync", async (data) => {
      try {
        const { chatRoomId, lastTimestamp } = data;
        if (!chatRoomId) return;

        const room = await ChatRoom.findById(chatRoomId);
        if (!room || !room.participants.some((p) => p.equals(userId))) return;

        const since = lastTimestamp ? new Date(lastTimestamp) : new Date(0);
        const messages = await Message.find({
          chatRoomId,
          createdAt: { $gt: since },
        })
          .sort({ createdAt: 1 })
          .limit(200)
          .populate("senderId", "firstName lastName photoUrl");

        socket.emit("sync_messages", {
          chatRoomId,
          messages: messages.map((m) => m.toObject()),
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence_update", { userId, isOnline: false });
        }
      }
    });
  });
}

module.exports = { initializeSocket };
