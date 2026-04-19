import { useState } from "react";
import { useSelector } from "react-redux";

const ChatList = ({ rooms, activeRoomId, loading, error, onSelectRoom, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const onlineUsers = useSelector((store) => store.chat.onlineUsers);
  const unreadCounts = useSelector((store) => store.chat.unreadCounts);

  const getPartner = (room) => {
    return room.participants?.find((p) => p._id !== currentUserId);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredRooms = rooms
    .filter((room) => {
      if (!searchQuery) return true;
      const partner = getPartner(room);
      if (!partner) return false;
      const name = `${partner.firstName} ${partner.lastName || ""}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt;
      const bTime = b.lastMessage?.createdAt || b.updatedAt;
      return new Date(bTime) - new Date(aTime);
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-xl font-bold gradient-text mb-3">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none input-glow transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/5"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400 text-sm">
              {searchQuery ? "No conversations found" : "No chats yet. Connect with developers to start chatting!"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => {
              const partner = getPartner(room);
              if (!partner) return null;
              const isOnline = onlineUsers.includes(partner._id);
              const unread = unreadCounts[room._id] || 0;
              const isActive = room._id === activeRoomId;

              return (
                <button
                  key={room._id}
                  onClick={() => onSelectRoom(room._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? "bg-purple-500/15 border border-purple-500/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                      <img
                        src={partner.photoUrl}
                        alt={partner.firstName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0f1729] ${
                        isOnline ? "bg-emerald-400 online-dot" : "bg-slate-600"
                      }`}
                    ></span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          unread > 0 ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {partner.firstName}{" "}
                        {partner.lastName || ""}
                      </h3>
                      {room.lastMessage?.createdAt && (
                        <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {room.lastMessage?.text || "Start a conversation..."}
                      </p>
                      {unread > 0 && (
                        <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ml-2">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
