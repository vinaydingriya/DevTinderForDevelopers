import { createSlice } from "@reduxjs/toolkit";

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState: {
    users: [],
    loading: false,
    error: null,
    currentIndex: 0,
    matches: [],
    interactionHistory: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasMore: false
    }
  },
  reducers: {
    // Set recommendations
    setRecommendations: (state, action) => {
      state.users = action.payload;
      state.currentIndex = 0;
      state.error = null;
    },

    // Add recommendations (for pagination)
    addRecommendations: (state, action) => {
      state.users = [...state.users, ...action.payload];
    },

    // Skip to next recommendation
    nextRecommendation: (state) => {
      if (state.currentIndex < state.users.length - 1) {
        state.currentIndex += 1;
      }
    },

    // Get current recommendation
    getCurrentRecommendation: (state) => {
      return state.users[state.currentIndex] || null;
    },

    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error state
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Set matches
    setMatches: (state, action) => {
      state.matches = action.payload;
    },

    // Set interaction history
    setInteractionHistory: (state, action) => {
      state.interactionHistory = action.payload;
    },

    // Add interaction to history
    addInteraction: (state, action) => {
      state.interactionHistory.unshift(action.payload);
    },

    // Update pagination
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    // Clear recommendations
    clearRecommendations: (state) => {
      state.users = [];
      state.currentIndex = 0;
      state.error = null;
    },

    // Remove current user from recommendations (after interaction)
    removeCurrentUser: (state) => {
      state.users.splice(state.currentIndex, 1);
      // Don't increment if we removed the last item
      if (state.currentIndex >= state.users.length && state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    }
  }
});

export const {
  setRecommendations,
  addRecommendations,
  nextRecommendation,
  getCurrentRecommendation,
  setLoading,
  setError,
  setMatches,
  setInteractionHistory,
  addInteraction,
  setPagination,
  clearRecommendations,
  removeCurrentUser
} = recommendationSlice.actions;

export default recommendationSlice.reducer;
