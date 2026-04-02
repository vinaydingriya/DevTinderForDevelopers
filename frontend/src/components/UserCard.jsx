import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";
import { useState } from "react";

const UserCard = ({ userData, showButton = true }) => {
  const { _id, firstName, lastName, photoUrl, about, age, gender } = showButton
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
