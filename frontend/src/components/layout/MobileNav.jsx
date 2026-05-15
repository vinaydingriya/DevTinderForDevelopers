import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Flame,
  MessageCircle,
  Users,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Flame, label: "Feed" },
  { path: "/chat", icon: MessageCircle, label: "Chats", badge: "chat" },
  { path: "/connections", icon: Users, label: "Connect" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "More" },
];

const MobileNav = () => {
  const location = useLocation();
  const unreadCounts = useSelector((store) => store.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-nav md:hidden">
      {navItems.map(({ path, icon: Icon, label, badge }) => {
        const active = isActive(path);
        const showBadge = badge === "chat" && totalUnread > 0;

        return (
          <Link
            key={path}
            to={path}
            className={`mobile-nav-item ${active ? "active" : ""}`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.6} />
              {showBadge && (
                <span className="mobile-nav-badge">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </div>
            <span className="mobile-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
