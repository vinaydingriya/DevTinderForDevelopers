import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Clock,
  UserCheck,
  UserPlus,
  Hourglass,
  Trash2,
  Loader2,
} from "lucide-react";

const statusConfig = {
  interested: {
    label: "Pending",
    color: "text-amber-400 bg-amber-500/15 border-amber-500/20",
    icon: Hourglass,
  },
  accepted: {
    label: "Connected",
    color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
    icon: UserCheck,
  },
  rejected: {
    label: "Declined",
    color: "text-red-400 bg-red-500/15 border-red-500/20",
    icon: UserPlus,
  },
  ignored: {
    label: "Ignored",
    color: "text-slate-400 bg-slate-500/15 border-slate-500/20",
    icon: UserPlus,
  },
};

const SuperLikesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchSuperLikes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/superlikes`, {
        withCredentials: true,
      });
      setProfiles(res.data.data);
    } catch (e) {
      console.error("Failed to load super likes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperLikes();
  }, []);

  const handleConnect = async (userId) => {
    setConnectingId(userId);
    try {
      await axios.post(
        `${BASE_URL}/superlike/${userId}/connect`,
        {},
        { withCredentials: true }
      );
      // Update profile's status locally
      setProfiles((prev) =>
        prev.map((p) =>
          p._id === userId ? { ...p, connectionStatus: "interested" } : p
        )
      );
    } catch (e) {
      const msg = e?.response?.data?.error || "Failed to send request";
      alert(msg);
    } finally {
      setConnectingId(null);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await axios.delete(`${BASE_URL}/superlike/${userId}`, {
        withCredentials: true,
      });
      setProfiles((prev) => prev.filter((p) => p._id !== userId));
    } catch (e) {
      console.error("Failed to remove:", e);
    } finally {
      setRemovingId(null);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <span className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin inline-block mb-4" />
          <p className="text-slate-400 text-sm">Loading super likes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
            <Star className="w-6 h-6 text-amber-400" fill="currentColor" strokeWidth={0} />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Super Likes</h1>
            <p className="text-sm text-slate-500">
              {profiles.length} developer{profiles.length !== 1 ? "s" : ""} you super liked
            </p>
          </div>
        </div>

        {/* Empty state */}
        {profiles.length === 0 ? (
          <div className="glass-card rounded-2xl gradient-border p-12 text-center">
            <div className="text-5xl mb-4 opacity-40">⭐</div>
            <h2 className="text-lg font-bold text-white mb-2">No Super Likes Yet</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              When you super like a developer on the feed, they'll appear here.
              Super likes show extra interest!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-sm"
            >
              Browse Feed →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile, index) => {
              const connStatus = profile.connectionStatus;
              const statusInfo = connStatus ? statusConfig[connStatus] : null;
              const StatusIcon = statusInfo?.icon;
              const isConnected = connStatus === "accepted";
              const hasPendingRequest = connStatus === "interested";
              const canConnect = !connStatus;

              return (
                <div
                  key={profile._id}
                  className="glass-card rounded-2xl p-4 gradient-border hover:scale-[1.005] transition-all duration-300 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar + Super Like badge */}
                    <Link to={`/user/${profile._id}`} className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-amber-500/30">
                        <img
                          src={profile.photoUrl}
                          alt={profile.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
                        <Star className="w-3 h-3 text-white" fill="currentColor" strokeWidth={0} />
                      </div>
                    </Link>

                    {/* Info */}
                    <Link to={`/user/${profile._id}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base truncate hover:text-purple-300 transition-colors">
                        {profile.firstName} {profile.lastName || ""}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {profile.age && profile.gender && (
                          <span className="text-xs text-slate-500">
                            {profile.age} · {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-slate-600">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(profile.superLikedAt)}
                        </span>
                      </div>
                    </Link>

                    {/* Status / Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Connection status badge */}
                      {statusInfo && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      )}

                      {/* Connect button (only if no connection request exists) */}
                      {canConnect && (
                        <button
                          onClick={() => handleConnect(profile._id)}
                          disabled={connectingId === profile._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {connectingId === profile._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          Connect
                        </button>
                      )}

                      {/* Chat (only if connected) */}
                      {isConnected && (
                        <Link
                          to={`/chat?userId=${profile._id}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                          title="Chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Remove super like */}
                      <button
                        onClick={() => handleRemove(profile._id)}
                        disabled={removingId === profile._id}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-40"
                        title="Remove super like"
                      >
                        {removingId === profile._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* About snippet */}
                  {profile.about && (
                    <p className="text-xs text-slate-500 mt-3 truncate pl-[72px]">
                      {profile.about}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperLikesPage;
