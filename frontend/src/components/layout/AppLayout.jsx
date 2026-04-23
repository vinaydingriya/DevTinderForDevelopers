import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../utils/userSlice";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth check — moved from Body.jsx
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchUser() {
      if (user.data) return;

      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
          signal,
        });
        dispatch(addUser(res.data.data));
      } catch (e) {
        // Cancelled requests (e.g. React StrictMode cleanup) must not
        // trigger a redirect — /login is a separate route tree so
        // navigating there would unmount AppLayout and abort the real call.
        if (e.code === "ERR_CANCELED" || e.code === "ECONNABORTED") return;
        console.log(e);
        navigate("/login");
      }
    }

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [dispatch, navigate, user]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#0f1729]">
      {/* Sidebar — only show when user is authenticated */}
      {user?.data && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
      )}

      {/* Main content area */}
      <main className="content-area flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
