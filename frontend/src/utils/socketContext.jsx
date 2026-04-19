import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { BASE_URL } from "./constants";
import {
  addMessage,
  setOnlineUsers,
  toggleUserOnline,
  setTyping,
  clearTyping,
  updateMessageStatus,
  markRoomMessagesRead,
  updateRoomLastMessage,
  setUnreadCount,
} from "./chatSlice";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((store) => store.user);
  const activeRoomId = useSelector((store) => store.chat.activeRoomId);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.data?._id) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect Socket.IO  
    const socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("online_users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("presence_update", ({ userId, isOnline }) => {
      dispatch(toggleUserOnline({ userId, isOnline }));
    });

    socket.on("receive_message", (message) => {
      dispatch(addMessage(message));
      dispatch(
        updateRoomLastMessage({
          roomId: message.chatRoomId,
          lastMessage: {
            text: message.text?.substring(0, 100),
            senderId: message.senderId?._id || message.senderId,
            createdAt: message.createdAt,
          },
        })
      );

      // If message is from someone else and we're not in that room, increment unread
      const msgSenderId = message.senderId?._id || message.senderId;
      if (msgSenderId !== user.data._id) {
        // Auto-deliver acknowledgment
        socket.emit("message_delivered", { messageId: message._id });
      }
    });

    socket.on("typing", ({ userId, chatRoomId }) => {
      dispatch(setTyping({ chatRoomId, userId }));
    });

    socket.on("stop_typing", ({ chatRoomId }) => {
      dispatch(clearTyping({ chatRoomId }));
    });

    socket.on("message_delivered", ({ messageId, deliveredAt }) => {
      // Find which room this message belongs to and update
      dispatch(
        updateMessageStatus({
          messageId,
          status: "delivered",
          deliveredAt,
        })
      );
    });

    socket.on("message_read", ({ messageId, readAt }) => {
      dispatch(
        updateMessageStatus({
          messageId,
          status: "read",
          readAt,
        })
      );
    });

    socket.on("messages_read", ({ chatRoomId, readAt }) => {
      dispatch(markRoomMessagesRead({ chatRoomId, readAt }));
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?.data?._id, dispatch]);

  const value = {
    socket: socketRef.current,
    isConnected,
    joinRoom: (chatRoomId) => {
      socketRef.current?.emit("join_room", { chatRoomId });
    },
    leaveRoom: (chatRoomId) => {
      socketRef.current?.emit("leave_room", { chatRoomId });
    },
    sendMessage: (chatRoomId, text, clientMessageId) => {
      socketRef.current?.emit("send_message", {
        chatRoomId,
        text,
        clientMessageId,
      });
    },
    emitTyping: (chatRoomId) => {
      socketRef.current?.emit("typing", { chatRoomId });
    },
    emitStopTyping: (chatRoomId) => {
      socketRef.current?.emit("stop_typing", { chatRoomId });
    },
    markAsRead: (chatRoomId) => {
      socketRef.current?.emit("message_read", { chatRoomId });
    },
    reconnectSync: (chatRoomId, lastTimestamp) => {
      socketRef.current?.emit("reconnect_sync", { chatRoomId, lastTimestamp });
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
