import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: [],
    reducers: {
        addFeed: (state, action)=> action.payload,
        removeFeed: (state, action)=> state.filter(f => f._id !== action.payload),
        removeAllFeed: ()=> []
    }
})

export const {addFeed, removeFeed, removeAllFeed} = feedSlice.actions;
export default feedSlice.reducer;