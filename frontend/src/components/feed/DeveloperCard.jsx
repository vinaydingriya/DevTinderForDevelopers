import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { useDispatch } from "react-redux";
import { removeFeed } from "../../utils/feedSlice";
import { Star, X, Heart } from "lucide-react";

const DeveloperCard = ({ user, totalCount, currentIndex }) => {
  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    about,
    age,
    gender,
    score,
  } = user;

  const [loading, setLoading] = useState(false);
  const [animDir, setAnimDir] = useState(null); // "left" | "right" | "up"
  const dispatch = useDispatch();

  const handleSend = useCallback(
    async (status) => {
      if (loading) return;
      setLoading(true);
      setAnimDir(status === "ignored" ? "left" : "right");

      setTimeout(async () => {
        try {
          await api.post(`/request/send/${status}/${_id}`,
            {});
          dispatch(removeFeed(_id));
        } catch (e) {
          if (e?.response?.data?.error === "Connection request already exists") {
            dispatch(removeFeed(_id));
          }
          console.error(e);
        } finally {
          setLoading(false);
          setAnimDir(null);
        }
      }, 300);
    },
    [_id, loading, dispatch]
  );

  const handleSuperLike = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setAnimDir("up");

    setTimeout(async () => {
      try {
        // 1. Save the super like
        await api.post(`/superlike/${_id}`,
          {});
      } catch (e) {
        console.error("Super like save:", e?.response?.data?.error || e);
      }

      try {
        // 2. Also send interested connection request
        await api.post(`/request/send/interested/${_id}`,
          {});
      } catch (e) {
        // It's OK if connection request already exists
        console.error("Connect:", e?.response?.data?.error || e);
      }

      dispatch(removeFeed(_id));
      setLoading(false);
      setAnimDir(null);
    }, 300);
  }, [_id, loading, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") handleSend("ignored");
      if (e.key === "ArrowRight") handleSend("interested");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleSend]);

  // Card animation classes
  const getAnimClass = () => {
    if (animDir === "left") return "card-exit-left";
    if (animDir === "right") return "card-exit-right";
    if (animDir === "up") return "card-exit-up";
    return "card-enter";
  };

  const matchPercent = score ? (score * 100).toFixed(0) : null;

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 sm:px-4">
      {/* Card */}
      <div
        className={`relative w-full max-w-[380px] rounded-3xl overflow-hidden glass-card gradient-border ${getAnimClass()}`}
        style={{ maxHeight: "calc(100vh - 140px)" }}
      >
        {/* Photo */}
        <div className="relative h-[280px] sm:h-[340px] md:h-[380px] overflow-hidden">
          <img
            src={photoUrl}
            alt={`${firstName}'s photo`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Match score badge */}
          {matchPercent && (
            <div className="absolute top-4 right-4 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#8b5cf6 ${matchPercent}%, rgba(255,255,255,0.08) 0)`,
              }}
            >
              <div className="w-11 h-11 rounded-full bg-[#0f1729] flex items-center justify-center">
                <span className="text-sm font-bold text-purple-300">
                  {matchPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {firstName} {lastName || ""}
            </h2>
            {age && gender && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm border border-white/10">
                  {age} · {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="p-5 pb-3">
          {about && (
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 mb-2">
              {about}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 px-5 pb-5">
          {/* Pass */}
          <button
            onClick={() => handleSend("ignored")}
            disabled={loading}
            className="group w-14 h-14 rounded-full flex items-center justify-center border-2 border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-40"
            title="Pass (←)"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </button>

          {/* Super Like */}
          <button
            onClick={handleSuperLike}
            disabled={loading}
            className="group w-11 h-11 rounded-full flex items-center justify-center border-2 border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-white hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-300 disabled:opacity-40"
            title="Super Like"
          >
            <Star className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </button>

          {/* Like / Connect */}
          <button
            onClick={() => handleSend("interested")}
            disabled={loading}
            className="group w-14 h-14 rounded-full flex items-center justify-center border-2 border-emerald-400/40 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-40"
            title="Connect (→)"
          >
            <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Progress counter */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-slate-500">
          {currentIndex + 1} of {totalCount}
        </span>
        <div className="w-24 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Keyboard hint — hidden on touch devices */}
      <p className="mt-2 text-[10px] text-slate-600 hidden md:block">
        Use <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono text-[10px]">←</kbd> Pass · <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono text-[10px]">→</kbd> Connect
      </p>
    </div>
  );
};

export default DeveloperCard;
