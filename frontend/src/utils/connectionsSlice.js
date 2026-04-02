import { createSlice } from "@reduxjs/toolkit";

const connectionsSlice = createSlice({
    name: "connections",
    initialState: [],
    reducers: {
        addConnections: (state,action)=> action.payload,
        removeAllConnections: ()=> []
    }
})

export const {addConnections, removeAllConnections} = connectionsSlice.actions;
export default connectionsSlice.reducer;