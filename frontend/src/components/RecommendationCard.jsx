import { useState } from "react";

/* eslint-disable react/prop-types */
const UserCard = ({ user, onViewCompatibility }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!user) {
    return (
      <div className="text-center text-gray-400 py-20">
        <p>No user to display</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition hover:scale-105">
        {/* Profile Image */}
        <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gray-200">
          <img
            src={user.photoUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x500?text=Developer";
            }}
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

          {/* Badge - Match Score */}
          {user.score && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {(user.score * 100).toFixed(0)}% Match
            </div>
          )}

          {/* Premium Badge */}
          <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ Profile
          </div>

          {/* User Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                {user.age && (
                  <p className="text-lg text-gray-200 mt-1">{user.age} years old</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-8">
          {/* About Section */}
          {user.about && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {user.about}
              </p>
            </div>
          )}

          {/* Skills Section */}
          {user.skills && user.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Skills ({user.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-full text-sm font-semibold hover:from-blue-200 hover:to-purple-200 transition"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests Section */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Interests ({user.interests.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-pink-100 to-red-100 text-gray-800 rounded-full text-sm font-semibold hover:from-pink-200 hover:to-red-200 transition"
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Metrics */}
          {user.matchMetrics && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Compatibility Metrics
              </h3>
              <div className="space-y-3">
                {/* Skill Match Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Skill Match
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {user.matchMetrics.skillSimilarity}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${user.matchMetrics.skillSimilarity}%` }}
                    ></div>
                  </div>
                </div>

                {/* Interest Match Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Interest Match
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {user.matchMetrics.interestSimilarity}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${user.matchMetrics.interestSimilarity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View More Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            {showDetails ? "Hide Details ▲" : "View Full Profile ▼"}
          </button>

          {/* Extended Details */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {user.age && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Age</p>
                    <p className="text-lg font-bold text-gray-800">{user.age}</p>
                  </div>
                )}
                {user.totalSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Total Skills
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {user.skills?.length || 0}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="space-y-3">
                <button
                  onClick={onViewCompatibility}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  📊 View Full Compatibility Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Tip */}
      <div className="text-center mt-4 text-sm text-gray-400">
        <p>👇 Like or Skip to continue</p>
      </div>
    </div>
  );
};

export default UserCard;
