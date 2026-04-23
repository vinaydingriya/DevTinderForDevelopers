import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { setRooms, setActiveRoom } from "../../utils/chatSlice";
import { useSocket } from "../../utils/socketContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const ChatPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((store) => store.user);
  const { rooms, activeRoomId } = useSelector((store) => store.chat);
  const { isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [error, setError] = useState("");

  // Fetch all chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/chat/rooms`, {
        withCredentials: true,
      });
      dispatch(setRooms(res.data.data));
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user?.data) {
      fetchRooms();
    }
  }, [user?.data, fetchRooms]);

  // Handle ?userId= query param to auto-open a chat
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !user?.data) return;

    async function openChatWithUser() {
      try {
        const res = await axios.get(`${BASE_URL}/chat/room/${targetUserId}`, {
          withCredentials: true,
        });
        const room = res.data.data;

        // Add to rooms if not already there
        const existingRoom = rooms.find((r) => r._id === room._id);
        if (!existingRoom) {
          dispatch(setRooms([room, ...rooms]));
        }

        dispatch(setActiveRoom(room._id));
        setMobileShowChat(true);
        // Clear the query param
        setSearchParams({});
      } catch (e) {
        setError(e?.response?.data?.error || "Cannot open chat");
      }
    }

    openChatWithUser();
  }, [searchParams, user?.data]);

  const handleSelectRoom = (roomId) => {
    dispatch(setActiveRoom(roomId));
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
    dispatch(setActiveRoom(null));
  };

  if (!user?.data) return null;

  return (
    <div className="w-full h-full flex animate-fade-in-up">
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl rounded-xl px-4 py-2 text-amber-300 text-sm font-medium shadow-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Reconnecting...
          </div>
        </div>
      )}

      {/* Chat List Sidebar */}
      <div
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 flex-col border-r border-white/5 h-full`}
      >
        <ChatList
          rooms={rooms}
          activeRoomId={activeRoomId}
          loading={loading}
          error={error}
          onSelectRoom={handleSelectRoom}
          currentUserId={user.data._id}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full min-w-0`}
      >
        {activeRoomId ? (
          <ChatWindow
            roomId={activeRoomId}
            currentUserId={user.data._id}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4 animate-float">💬</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">
              DevTinder Chat
            </h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Select a conversation to start chatting with your dev connections.
              Share code, repos, and collaborate!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
