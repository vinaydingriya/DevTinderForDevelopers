import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"
import feedReducer from "./feedSlice"
import connectionsReducer from "./connectionsSlice"
import requestsReducer from "./requestsSlice"
import recommendationReducer from "./recommendationSlice"
import filterReducer from "./filterSlice"
import chatReducer from "./chatSlice"

const store = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections: connectionsReducer,
        requests: requestsReducer,
        recommendations: recommendationReducer,
        filters: filterReducer,
        chat: chatReducer
    }
})
export default store;