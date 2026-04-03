import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setRecommendations,
  setLoading,
  setError,
  removeCurrentUser,
  addInteraction
} from "../utils/recommendationSlice";
import RecommendationCard from "./RecommendationCard";
import axios from "axios";

const Recommendations = () => {
  const dispatch = useDispatch();
  const { users, currentIndex, loading, error } = useSelector(
    state => state.recommendations
  );
  const [isMatching, setIsMatching] = useState(false);

  // Fetch recommendations on component mount
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch more when running low on recommendations
  useEffect(() => {
    if (users.length - currentIndex <= 3) {
      fetchMoreRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, users.length]);

  /**
   * Fetch initial recommendations from API
   */
  const fetchRecommendations = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations?limit=10`,
        {
          withCredentials: true
        }
      );

      dispatch(setRecommendations(response.data.data));
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to load recommendations"));
      console.error("Error fetching recommendations:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Fetch more recommendations for pagination
   */
  const fetchMoreRecommendations = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations/feed?page=${Math.ceil(
          (currentIndex + 1) / 10
        )}&pageSize=10`,
        {
          withCredentials: true
        }
      );

      // Add to existing recommendations
      if (response.data.data && response.data.data.length > 0) {
        dispatch({ type: "recommendations/addRecommendations", payload: response.data.data });
      }
    } catch (err) {
      console.error("Error fetching more recommendations:", err);
    }
  };

  /**
   * Handle like action
   */
  const handleLike = async () => {
    if (!users[currentIndex]) return;

    try {
      setIsMatching(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations/${users[currentIndex]._id}/like`,
        {},
        {
          withCredentials: true
        }
      );

      dispatch(
        addInteraction({
          user: users[currentIndex],
          action: "liked",
          isMatch: response.data.isMatch
        })
      );

      // Show match celebration if mutual like
      if (response.data.isMatch) {
        alert(`🎉 It's a Match with ${users[currentIndex].firstName}!`);
      }

      // Remove current user and move to next
      dispatch(removeCurrentUser());
    } catch (err) {
      alert(err.response?.data?.message || "Error liking user");
      console.error("Error liking user:", err);
    } finally {
      setIsMatching(false);
    }
  };

  /**
   * Handle skip action
   */
  const handleSkip = async () => {
    if (!users[currentIndex]) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations/${users[currentIndex]._id}/skip`,
        {},
        {
          withCredentials: true
        }
      );

      dispatch(
        addInteraction({
          user: users[currentIndex],
          action: "skipped"
        })
      );

      // Remove current user and move to next
      dispatch(removeCurrentUser());
    } catch (err) {
      alert(err.response?.data?.message || "Error skipping user");
      console.error("Error skipping user:", err);
    }
  };

  /**
   * Handle view compatibility
   */
  const handleViewCompatibility = async () => {
    if (!users[currentIndex]) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/recommendations/${users[currentIndex]._id}/compatibility`,
        {
          withCredentials: true
        }
      );

      alert(
        `Compatibility Report:\n\n` +
        `Skill Match: ${response.data.data.compatibility.skillSimilarity}%\n` +
        `Interest Match: ${response.data.data.compatibility.interestSimilarity}%\n` +
        `Overall: ${response.data.data.compatibility.overallCompatibility}%\n\n` +
        `Common Skills: ${response.data.data.compatibility.commonSkills.join(", ") || "None"}\n` +
        `Common Interests: ${response.data.data.compatibility.commonInterests.join(", ") || "None"}`
      );
    } catch (err) {
      alert("Error loading compatibility");
      console.error("Error loading compatibility:", err);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading amazing developers...</p>
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
            onClick={fetchRecommendations}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <p className="text-2xl text-white mb-4">🎉 You&apos;ve seen everyone nearby!</p>
          <p className="text-gray-400 mb-6">Check back soon for new developers</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  const progress = ((currentIndex + 1) / users.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Find Developers
        </h1>
        <p className="text-gray-400">
          {currentIndex + 1} of {users.length}
        </p>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Card Container */}
      <div className="max-w-2xl mx-auto">
        <RecommendationCard
          user={currentUser}
          onViewCompatibility={handleViewCompatibility}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center md:justify-between flex-wrap">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={isMatching}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">⏭️</span>
            <span className="font-semibold">Skip</span>
          </button>

          {/* Compatibility Button */}
          <button
            onClick={handleViewCompatibility}
            disabled={isMatching}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📊</span>
            <span className="font-semibold">Details</span>
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isMatching}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            <span className="text-xl">❤️</span>
            <span>Like</span>
          </button>
        </div>

        {/* Match Count */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            💬 Keyboard: Left arrow to skip, Right arrow to like
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
