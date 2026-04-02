import Login from "./components/Login"
import Body from "./components/Body"
import Profile from "./components/Profile"
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
// import Chat from "./components/Chat";

import appStore from "./utils/appStore";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Password from "./components/Password";
import Premium from "./components/Premium";
function App() {

  return (
    <>
      <Provider store={appStore}>
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
              {/* <Route path="/chat/:targetUserID" element={<Chat />} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App