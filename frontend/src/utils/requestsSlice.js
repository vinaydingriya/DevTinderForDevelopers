import { createSlice } from "@reduxjs/toolkit";

const requestsSlice = createSlice({
    name: "requests",
    initialState: [],
    reducers: {
        addRequests: (state,action)=> action.payload,
        removeRequest: (state, action)=> state.filter(r => r._id !== action.payload),
        removeAllRequests: ()=> []
    }
})

export const {addRequests, removeRequest, removeAllRequests} = requestsSlice.actions;
export default requestsSlice.reducer;