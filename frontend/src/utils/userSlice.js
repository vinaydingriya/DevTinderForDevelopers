import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {},
    reducers: {
        addUser: (state, action)=> {
            state.data = action.payload
        },
        removeUser: ()=> {
            return {};
        }
    }
})

export const {addUser, removeUser} = userSlice.actions;
export default userSlice.reducer;