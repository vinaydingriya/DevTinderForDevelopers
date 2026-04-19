import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    rooms: [],
    activeRoomId: null,
    messages: {},
    typingUsers: {},
    onlineUsers: [],
    unreadCounts: {},
  },
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
      action.payload.forEach((room) => {
        if (room.unreadCount !== undefined) {
          state.unreadCounts[room._id] = room.unreadCount;
        }
      });
    },
    setActiveRoom: (state, action) => {
      state.activeRoomId = action.payload;
    },
    addMessage: (state, action) => {
      const { chatRoomId } = action.payload;
      if (!state.messages[chatRoomId]) {
        state.messages[chatRoomId] = [];
      }
      // Prevent duplicates
      const exists = state.messages[chatRoomId].some(
        (m) =>
          m._id === action.payload._id ||
          (action.payload.clientMessageId &&
            m.clientMessageId === action.payload.clientMessageId)
      );
      if (!exists) {
        state.messages[chatRoomId].push(action.payload);
      }
    },
    setMessages: (state, action) => {
      const { chatRoomId, messages } = action.payload;
      state.messages[chatRoomId] = messages;
    },
    prependMessages: (state, action) => {
      const { chatRoomId, messages } = action.payload;
      if (!state.messages[chatRoomId]) {
        state.messages[chatRoomId] = [];
      }
      const existingIds = new Set(state.messages[chatRoomId].map((m) => m._id));
      const newMessages = messages.filter((m) => !existingIds.has(m._id));
      state.messages[chatRoomId] = [...newMessages, ...state.messages[chatRoomId]];
    },
    updateMessageStatus: (state, action) => {
      const { chatRoomId, messageId, status, readAt, deliveredAt } = action.payload;
      if (state.messages[chatRoomId]) {
        const msg = state.messages[chatRoomId].find((m) => m._id === messageId);
        if (msg) {
          msg.status = status;
          if (readAt) msg.readAt = readAt;
          if (deliveredAt) msg.deliveredAt = deliveredAt;
        }
      }
    },
    markRoomMessagesRead: (state, action) => {
      const { chatRoomId, readAt } = action.payload;
      if (state.messages[chatRoomId]) {
        state.messages[chatRoomId].forEach((msg) => {
          if (msg.status !== "read") {
            msg.status = "read";
            msg.readAt = readAt;
          }
        });
      }
    },
    setTyping: (state, action) => {
      const { chatRoomId, userId } = action.payload;
      state.typingUsers[chatRoomId] = userId;
    },
    clearTyping: (state, action) => {
      const { chatRoomId } = action.payload;
      delete state.typingUsers[chatRoomId];
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    toggleUserOnline: (state, action) => {
      const { userId, isOnline } = action.payload;
      if (isOnline && !state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      } else if (!isOnline) {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setUnreadCount: (state, action) => {
      const { roomId, count } = action.payload;
      state.unreadCounts[roomId] = count;
    },
    decrementUnread: (state, action) => {
      const { roomId } = action.payload;
      if (state.unreadCounts[roomId]) {
        state.unreadCounts[roomId] = 0;
      }
    },
    updateRoomLastMessage: (state, action) => {
      const { roomId, lastMessage } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) {
        room.lastMessage = lastMessage;
        room.updatedAt = new Date().toISOString();
      }
    },
    resetChat: () => ({
      rooms: [],
      activeRoomId: null,
      messages: {},
      typingUsers: {},
      onlineUsers: [],
      unreadCounts: {},
    }),
  },
});

export const {
  setRooms,
  setActiveRoom,
  addMessage,
  setMessages,
  prependMessages,
  updateMessageStatus,
  markRoomMessagesRead,
  setTyping,
  clearTyping,
  setOnlineUsers,
  toggleUserOnline,
  setUnreadCount,
  decrementUnread,
  updateRoomLastMessage,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
