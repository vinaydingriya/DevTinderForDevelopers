import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],       // All notifications
    toasts: [],      // Currently visible toast notifications
  },
  reducers: {
    addNotification: (state, action) => {
      const notif = {
        id: Date.now() + Math.random().toString(36).slice(2),
        read: false,
        ...action.payload,
      };
      state.items.unshift(notif);
      // Keep last 50
      if (state.items.length > 50) state.items = state.items.slice(0, 50);
      // Also add to toasts
      state.toasts.push(notif);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.read = true));
    },
    clearNotifications: () => ({
      items: [],
      toasts: [],
    }),
  },
});

export const { addNotification, removeToast, markAllRead, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
