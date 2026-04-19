import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { setMessages, prependMessages, decrementUnread } from "../../utils/chatSlice";
import { useSocket } from "../../utils/socketContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import SharedResourcesPanel from "./SharedResourcesPanel";
import GitHubProfileCard from "./GitHubProfileCard";

const ChatWindow = ({ roomId, currentUserId, onBack }) => {
  const dispatch = useDispatch();
  const messages = useSelector((store) => store.chat.messages[roomId] || []);
  const rooms = useSelector((store) => store.chat.rooms);
  const typingUser = useSelector((store) => store.chat.typingUsers[roomId]);
  const onlineUsers = useSelector((store) => store.chat.onlineUsers);

  const { joinRoom, leaveRoom, markAsRead } = useSocket();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showResources, setShowResources] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);

  const room = rooms.find((r) => r._id === roomId);
  const partner = room?.participants?.find((p) => p._id !== currentUserId);
  const isOnline = partner ? onlineUsers.includes(partner._id) : false;

  // Join room on mount
  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      return () => {
        leaveRoom(roomId);
      };
    }
  }, [roomId]);

  // Fetch message history
  const fetchMessages = useCallback(
    async (pageNum = 1) => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(
          `${BASE_URL}/chat/messages/${roomId}?page=${pageNum}&limit=50`,
          { withCredentials: true }
        );

        if (pageNum === 1) {
          dispatch(setMessages({ chatRoomId: roomId, messages: res.data.data }));
        } else {
          dispatch(prependMessages({ chatRoomId: roomId, messages: res.data.data }));
        }

        setHasMore(res.data.pagination.hasMore);
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        setLoadingMessages(false);
      }
    },
    [roomId, dispatch]
  );

  useEffect(() => {
    if (roomId) {
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [roomId, fetchMessages]);

  // Mark messages as read when opening the chat
  useEffect(() => {
    if (roomId && messages.length > 0) {
      markAsRead(roomId);
      dispatch(decrementUnread({ roomId }));
    }
  }, [roomId, messages.length]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom || page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Infinite scroll up for older messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || loadingMessages || !hasMore) return;

    if (container.scrollTop < 100) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  if (!room || !partner) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-[#0f1729]/80 backdrop-blur-md">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Partner info */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
            <img src={partner.photoUrl} alt={partner.firstName} className="w-full h-full object-cover" />
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f1729] ${
              isOnline ? "bg-emerald-400 online-dot" : "bg-slate-600"
            }`}
          ></span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {partner.firstName} {partner.lastName || ""}
          </h3>
          <p className="text-[11px] text-slate-500">
            {isOnline ? (
              <span className="text-emerald-400">Online</span>
            ) : (
              "Offline"
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {partner.githubUsername && (
            <button
              onClick={() => setShowGitHub(!showGitHub)}
              className={`p-2 rounded-lg transition-colors ${
                showGitHub ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-slate-400"
              }`}
              title="GitHub Profile"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowResources(!showResources)}
            className={`p-2 rounded-lg transition-colors ${
              showResources ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-slate-400"
            }`}
            title="Shared Resources"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {/* Loading indicator for older messages */}
            {loadingMessages && page > 1 && (
              <div className="text-center py-2">
                <span className="inline-block w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
              </div>
            )}

            {!loadingMessages && !hasMore && messages.length > 0 && (
              <div className="text-center py-2">
                <p className="text-xs text-slate-600">Beginning of conversation</p>
              </div>
            )}

            {loadingMessages && page === 1 ? (
              <div className="flex items-center justify-center h-full">
                <span className="inline-block w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-slate-400 text-sm">
                  Say hello to {partner.firstName}!
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Try sharing a repo with @owner/repo
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id || msg.clientMessageId}
                  message={msg}
                  isSelf={
                    (msg.senderId?._id || msg.senderId) === currentUserId
                  }
                />
              ))
            )}

            {/* Typing indicator */}
            {typingUser && typingUser !== currentUserId && (
              <TypingIndicator name={partner.firstName} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput roomId={roomId} />
        </div>

        {/* Shared Resources Panel */}
        {showResources && (
          <SharedResourcesPanel roomId={roomId} onClose={() => setShowResources(false)} />
        )}

        {/* GitHub Profile Panel */}
        {showGitHub && partner.githubUsername && (
          <div className="w-72 border-l border-white/5 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">GitHub Profile</h3>
              <button onClick={() => setShowGitHub(false)} className="text-slate-500 hover:text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <GitHubProfileCard username={partner.githubUsername} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
