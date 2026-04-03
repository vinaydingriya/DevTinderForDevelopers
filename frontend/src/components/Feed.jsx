import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import FilterPanel from "./FilterPanel";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const filters = useSelector((store) => store.filters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function handleFeed() {
      setLoading(true);
      setError(null);

      try {
        let res;

        // Use recommendation filter endpoint if filters are applied
        if (filters.appliedFilters.length > 0) {
          const skillsQuery = filters.appliedFilters.join(",");
          res = await axios.get(
            BASE_URL + `/api/recommendations/filtered-by-skills?skills=${encodeURIComponent(skillsQuery)}&limit=50`,
            {
              withCredentials: true,
              signal
            }
          );
          setIsFiltered(true);
        } else {
          // Use regular feed endpoint if no filters applied
          res = await axios.get(BASE_URL + "/api/feed", {
            withCredentials: true,
            signal
          });
          setIsFiltered(false);
        }

        dispatch(addFeed(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
          console.error("Feed fetch error details:", {
            message: e.message,
            status: e.response?.status,
            statusText: e.response?.statusText,
            data: e.response?.data,
            url: e.config?.url,
            method: e.config?.method
          });
          
          const errorMsg = 
            e.response?.data?.message || 
            e.response?.statusText || 
            e.message || 
            "Failed to load feed";
          
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    }

    handleFeed();

    return () => {
      controller.abort();
    };
  }, [dispatch, filters.appliedFilters]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-spin">⚙️</div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Loading Developers...</h1>
        <p className="text-slate-400 text-sm">Finding the best matches for you</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <FilterPanel />
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Error Loading Feed</h1>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="py-8">
        <FilterPanel />
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-float">🔍</div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            {isFiltered ? "No Matches Found" : "No More Profiles"}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl text-center">
            {isFiltered
              ? "No developers match your selected skills. Try removing some filters or adding different skills."
              : "Check back later for new developers!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in-up">
      <FilterPanel />
      
      {/* Show message if skills are added but not applied */}
      {filters.skills.length > 0 && filters.appliedFilters.length === 0 && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
          <p className="text-blue-200 text-sm text-center">
            ✨ You have {filters.skills.length} skill{filters.skills.length !== 1 ? "s" : ""} added. Click the <span className="font-bold">Search</span> button to find matching developers.
          </p>
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-center gradient-text mb-2">
        Discover Developers
      </h1>
      <p className="text-center text-slate-400 text-sm mb-8">
        {isFiltered
          ? `Found ${feed.length} developers with your selected skills`
          : `Showing ${feed.length} recommended developers`}
      </p>
      <div className="flex justify-center">
        <UserCard userData={feed[0]} />
      </div>
    </div>
  );
};

export default Feed;
