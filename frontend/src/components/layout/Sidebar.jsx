import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

import { removeUser } from "../../utils/userSlice";
import { removeAllFeed } from "../../utils/feedSlice";
import { removeAllRequests } from "../../utils/requestsSlice";
import { removeAllConnections } from "../../utils/connectionsSlice";
import { resetChat } from "../../utils/chatSlice";

import {
  Flame,
  MessageCircle,
  Users,
  Inbox,
  User,
  Crown,
  Lock,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Flame, label: "Feed" },
  { path: "/chat", icon: MessageCircle, label: "Chats", badge: "chat" },
  { path: "/connections", icon: Users, label: "Connections" },
  { path: "/requests", icon: Inbox, label: "Requests" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/premium", icon: Crown, label: "Premium" },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCounts = useSelector((store) => store.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

  async function handleLogout() {
    try {
      const res = await axios.post(
        BASE_URL + "/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(removeUser());
        dispatch(removeAllConnections());
        dispatch(removeAllFeed());
        dispatch(removeAllRequests());
        dispatch(resetChat());
        navigate("/login");
      }
    } catch (e) {
      console.log(e);
    }
  }

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`sidebar h-full flex flex-col ${
        collapsed ? "sidebar-collapsed w-[60px]" : "w-[280px]"
      }`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between p-4 pb-2">
        <Link to="/" className="sidebar-logo flex items-center gap-2 group flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">💻</span>
          <span className="sidebar-logo-text text-lg font-bold gradient-text truncate group-hover:opacity-80 transition-opacity">
            DevTinder
          </span>
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 hidden md:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── User mini card ── */}
      {user?.data && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-purple-500/20 flex-shrink-0">
              <img
                src={user.data.photoUrl}
                alt={user.data.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sidebar-user-info min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.data.firstName}{" "}
                {user.data.lastName || ""}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user.data.email || "Developer"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-divider" />

      {/* ── Navigation ── */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const active = isActive(path);
          const showBadge = badge === "chat" && totalUnread > 0;

          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="nav-icon" strokeWidth={active ? 2.2 : 1.8} />
              <span className="sidebar-label truncate">{label}</span>
              {showBadge && (
                <span className="nav-badge">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-divider" />

      {/* ── Bottom section ── */}
      <div className="pb-3 pt-1">
        <Link
          to="/password"
          className={`sidebar-nav-item ${isActive("/password") ? "active" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Lock className="nav-icon" strokeWidth={1.8} />
          <span className="sidebar-label">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06]"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="nav-icon" strokeWidth={1.8} />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
