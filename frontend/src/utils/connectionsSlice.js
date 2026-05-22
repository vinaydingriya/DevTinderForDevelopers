import { createSlice } from "@reduxjs/toolkit";

const connectionsSlice = createSlice({
    name: "connections",
    initialState: [],
    reducers: {
        addConnections: (state,action)=> action.payload,
        removeConnection: (state, action) => {
            return state.filter(connection => connection._id !== action.payload);
        },
        removeAllConnections: ()=> []
    }
})

export const {addConnections, removeConnection, removeAllConnections} = connectionsSlice.actions;
export default connectionsSlice.reducer;