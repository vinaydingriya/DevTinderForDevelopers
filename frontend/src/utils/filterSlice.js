import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
  name: "filters",
  initialState: {
    skills: [], // Pending skills (UI state)
    appliedFilters: [], // Applied filters (actual search)
  },
  reducers: {
    toggleSkill: (state, action) => {
      const skill = action.payload;
      const index = state.skills.indexOf(skill);
      if (index > -1) {
        state.skills.splice(index, 1);
      } else {
        state.skills.push(skill);
      }
    },
    resetFilters: (state) => {
      state.skills = [];
      state.appliedFilters = [];
    },
    applyFilters: (state) => {
      state.appliedFilters = [...state.skills];
    },
  },
});

export const {
  toggleSkill,
  resetFilters,
  applyFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
