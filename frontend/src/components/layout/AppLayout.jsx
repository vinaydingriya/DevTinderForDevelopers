import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/api";
import { addUser } from "../../utils/userSlice";
import { addRequests } from "../../utils/requestsSlice";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth check — moved from Body.jsx
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchUser() {
      if (user.data) return;

      try {
        const res = await api.get("/profile/view", { signal });
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

  // Pre-fetch pending connection requests once authenticated to initialize badge counts
  useEffect(() => {
    if (!user?.data?._id) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchRequests() {
      try {
        const res = await api.get("/user/requests/received", { signal });
        dispatch(addRequests(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
          console.error("Failed to pre-fetch requests:", e);
        }
      }
    }

    fetchRequests();

    return () => {
      controller.abort();
    };
  }, [dispatch, user?.data?._id]);


  // Hide mobile nav on chat detail view
  const hideMobileNav = location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-[#0f1729]">
      {/* Desktop Sidebar */}
      {user?.data && (
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
        </div>
      )}

      {/* Main content area */}
      <main className="content-area flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {user?.data && !hideMobileNav && (
        <MobileNav />
      )}
    </div>
  );
};

export default AppLayout;
