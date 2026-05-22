import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Flame,
  MessageCircle,
  Users,
  Inbox,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Flame, label: "Feed" },
  { path: "/chat", icon: MessageCircle, label: "Chats", badge: "chat" },
  { path: "/connections", icon: Users, label: "Connect" },
  { path: "/requests", icon: Inbox, label: "Requests", badge: "requests" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "More" },
];

const MobileNav = () => {
  const location = useLocation();
  const unreadCounts = useSelector((store) => store.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);
  const requests = useSelector((store) => store.requests);
  const totalRequests = requests.length;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-nav md:hidden">
      {navItems.map(({ path, icon: Icon, label, badge }) => {
        const active = isActive(path);
        const showChatBadge = badge === "chat" && totalUnread > 0;
        const showRequestsBadge = badge === "requests" && totalRequests > 0;
        const showBadge = showChatBadge || showRequestsBadge;
        const badgeValue = showChatBadge
          ? (totalUnread > 9 ? "9+" : totalUnread)
          : (totalRequests > 9 ? "9+" : totalRequests);

        return (
          <Link
            key={path}
            to={path}
            className={`mobile-nav-item ${active ? "active" : ""}`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.6} />
              {showBadge && (
                <span
                  className="mobile-nav-badge"
                  style={showRequestsBadge ? { background: '#8b5cf6', boxShadow: '0 0 6px rgba(139, 92, 246, 0.5)' } : undefined}
                >
                  {badgeValue}
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
