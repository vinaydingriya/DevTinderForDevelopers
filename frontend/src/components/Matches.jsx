import { useEffect, useState } from "react";
import axios from "axios";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/matches`,
        {
          withCredentials: true
        }
      );

      setMatches(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load matches");
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMatches}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          💕 Your Matches
        </h1>
        <p className="text-gray-400 text-lg">
          {matches.length} developer{matches.length !== 1 ? "s" : ""} interested in you
        </p>
      </div>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-4">🔍</p>
            <p className="text-2xl text-white mb-2">No matches yet</p>
            <p className="text-gray-400 text-lg">
              Keep liking developers to find your next collaboration!
            </p>
          </div>
        </div>
      ) : (
        /* Grid of Matches */
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match._id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105"
            >
              {/* Profile Image */}
              <div className="relative w-full h-64 overflow-hidden bg-gray-200">
                <img
                  src={match.photoUrl}
                  alt={`${match.firstName} ${match.lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x400?text=Developer";
                  }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {/* Match Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  💕 Matched!
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {match.firstName} {match.lastName}
                  </h3>
                  {match.age && (
                    <p className="text-sm text-gray-600">{match.age} years old</p>
                  )}
                </div>

                {/* About */}
                {match.about && (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {match.about}
                  </p>
                )}

                {/* Skills */}
                {match.skills && match.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                          +{match.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {match.interests && match.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.interests.slice(0, 2).map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-semibold"
                        >
                          {interest}
                        </span>
                      ))}
                      {match.interests.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                          +{match.interests.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition text-sm">
                    💬 Message
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition text-sm">
                    👤 Profile
                  </button>
                </div>

                {/* Matched Date */}
                {match.matchedAt && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Matched on {new Date(match.matchedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
