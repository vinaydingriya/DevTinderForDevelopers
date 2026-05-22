import { createSlice } from "@reduxjs/toolkit";

const requestsSlice = createSlice({
    name: "requests",
    initialState: [],
    reducers: {
        addRequests: (state,action)=> action.payload,
        addSingleRequest: (state, action) => {
            if (!state.some(r => r._id === action.payload._id)) {
                state.unshift(action.payload);
            }
        },
        removeRequest: (state, action)=> state.filter(r => r._id !== action.payload),
        removeAllRequests: ()=> []
    }
})

export const {addRequests, addSingleRequest, removeRequest, removeAllRequests} = requestsSlice.actions;
export default requestsSlice.reducer;