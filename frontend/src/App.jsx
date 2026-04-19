import Login from "./components/Login"
import Body from "./components/Body"
import Profile from "./components/Profile"
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import ChatPage from "./components/chat/ChatPage";

import appStore from "./utils/appStore";
import { SocketProvider } from "./utils/socketContext";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Password from "./components/Password";
import Premium from "./components/Premium";
function App() {

  return (
    <>
      <Provider store={appStore}>
        <SocketProvider>
          <BrowserRouter basename="/">
            <Routes>
              <Route path="/" element={<Body />}>
                <Route path="/" element={<Feed />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/password" element={<Password />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/chat" element={<ChatPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </Provider>
    </>
  );
}

export default App