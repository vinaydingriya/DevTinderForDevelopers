import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";
import { useState } from "react";

/* eslint-disable react/prop-types */
const UserCard = ({ userData, showButton = true }) => {
  const { _id, firstName, lastName, photoUrl, about, age, gender, skills, interests, score, matchMetrics } = showButton
    ? userData
    : userData.data;

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  async function handleSend(status, _id) {
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(
        BASE_URL + `/request/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeFeed(_id));
    } catch (e) {
      if (e?.response?.data?.error === "Connection request already exists") {
        dispatch(removeFeed(_id));
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl w-80 overflow-hidden gradient-border hover:scale-[1.02] transition-all duration-300">
      {/* Photo */}
      <div className="relative overflow-hidden">
        <img
          src={photoUrl}
          alt={`${firstName}'s photo`}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        {/* Name overlay on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-xl font-bold text-white drop-shadow-lg">
            {firstName + (lastName ? " " + lastName : "")}
          </h2>
          {age && gender && (
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200 backdrop-blur-sm border border-purple-500/20">
              {age} · {gender}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {about && (
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4">
            {about}
          </p>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Skills ({skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30 hover:bg-blue-500/30 transition"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-3 py-1 bg-slate-600/30 text-slate-300 rounded-full text-xs font-medium">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Interests Section */}
        {interests && interests.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Interests ({interests.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs font-medium border border-pink-500/30 hover:bg-pink-500/30 transition"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Metrics */}
        {matchMetrics && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Compatibility
            </h3>
            {matchMetrics.skillSimilarity !== undefined && (
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">Skills</span>
                  <span className="text-xs font-bold text-blue-400">{matchMetrics.skillSimilarity}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${matchMetrics.skillSimilarity}%` }}
                  ></div>
                </div>
              </div>
            )}
            {matchMetrics.interestSimilarity !== undefined && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">Interests</span>
                  <span className="text-xs font-bold text-pink-400">{matchMetrics.interestSimilarity}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${matchMetrics.interestSimilarity}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match Score Badge */}
        {score && (
          <div className="mb-4 p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 text-center">
            <p className="text-xs text-slate-300">Match Score</p>
            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {(score * 100).toFixed(0)}%
            </p>
          </div>
        )}

        {showButton && (
          <div className="flex gap-3 justify-center">
            <button
              className="flex-1 py-2.5 rounded-xl btn-danger-gradient text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              onClick={() => handleSend("ignored", _id)}
              disabled={loading}
            >
              <span className="text-base">✕</span> Pass
            </button>

            <button
              className="flex-1 py-2.5 rounded-xl btn-success-gradient text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              onClick={() => handleSend("interested", _id)}
              disabled={loading}
            >
              <span className="text-base">♥</span> Connect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
