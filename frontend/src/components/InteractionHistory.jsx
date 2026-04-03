import { useEffect, useState } from "react";
import axios from "axios";

const InteractionHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, liked, skipped

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations/interaction-history`,
        {
          withCredentials: true
        }
      );

      setHistory(response.data.data);
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    return item.action === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          📋 Interaction History
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-6 text-white">
            <p className="text-sm font-semibold opacity-90">Liked</p>
            <p className="text-3xl font-bold">{stats.liked || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white">
            <p className="text-sm font-semibold opacity-90">Skipped</p>
            <p className="text-3xl font-bold">{stats.skipped || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-6 text-white">
            <p className="text-sm font-semibold opacity-90">Total</p>
            <p className="text-3xl font-bold">{stats.total || 0}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === "all"
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            All ({stats.total || 0})
          </button>
          <button
            onClick={() => setFilter("liked")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === "liked"
                ? "bg-pink-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            ❤️ Liked ({stats.liked || 0})
          </button>
          <button
            onClick={() => setFilter("skipped")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === "skipped"
                ? "bg-gray-600 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            ⏭️ Skipped ({stats.skipped || 0})
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="max-w-4xl mx-auto">
        {filteredHistory.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-4">📭</p>
            <p className="text-2xl text-white mb-2">No interactions yet</p>
            <p className="text-gray-400">
              Start swiping on the recommendations page!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 hover:from-gray-700 hover:to-gray-600 transition flex items-center justify-between"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <img
                    src={item.user.photoUrl}
                    alt={`${item.user.firstName} ${item.user.lastName}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64?text=User";
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {item.user.firstName} {item.user.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          item.action === "liked"
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-gray-600/20 text-gray-400"
                        }`}
                      >
                        {item.action === "liked" ? "❤️ Liked" : "⏭️ Skipped"}
                      </span>
                    </div>

                    {/* Skills */}
                    {item.user.skills && item.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.user.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp and Action */}
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-400">
                    {new Date(item.interactedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.interactedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  <button className="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded font-semibold transition">
                    👤 View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionHistory;
