import Login from "./components/Login";
import AppLayout from "./components/layout/AppLayout";
import Profile from "./components/Profile";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import ChatPage from "./components/chat/ChatPage";
import SettingsPage from "./components/SettingsPage";
import Premium from "./components/Premium";
import PostsPage from "./components/PostsPage";
import ConnectionProfile from "./components/ConnectionProfile";
import SuperLikesPage from "./components/SuperLikesPage";
import ToastNotification from "./components/ToastNotification";

import appStore from "./utils/appStore";
import { SocketProvider } from "./utils/socketContext";

import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Provider } from "react-redux";

/**
 * Minimal layout for unauthenticated pages (login/signup).
 * No sidebar — just a centered auth-bg screen.
 */
const LoginLayout = () => (
  <div className="min-h-screen flex items-center justify-center auth-bg">
    <Outlet />
  </div>
);

function App() {
  return (
    <>
      <Provider store={appStore}>
        <SocketProvider>
          <ToastNotification />
          <BrowserRouter basename="/">
            <Routes>
              {/* Login — standalone, no sidebar */}
              <Route path="/login" element={<LoginLayout />}>
                <Route index element={<Login />} />
              </Route>

              {/* Authenticated routes — sidebar layout */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Feed />} />
                <Route path="profile" element={<Profile />} />
                <Route path="connections" element={<Connections />} />
                <Route path="requests" element={<Requests />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="premium" element={<Premium />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="user/:userId" element={<ConnectionProfile />} />
                <Route path="superlikes" element={<SuperLikesPage />} />
                <Route path="chat" element={<ChatPage />} />
              </Route>

              {/* Catch-all: redirect unknown paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </Provider>
    </>
  );
}

export default App;