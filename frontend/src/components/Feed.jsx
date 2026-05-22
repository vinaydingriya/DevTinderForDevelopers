import api from "../utils/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import DeveloperCard from "./feed/DeveloperCard";
import DeveloperDetails from "./feed/DeveloperDetails";
import PostFeed from "./feed/PostFeed";
import CreatePostModal from "./feed/CreatePostModal";
import FilterPanel from "./FilterPanel";
import { SlidersHorizontal, Plus } from "lucide-react";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const filters = useSelector((store) => store.filters);
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const listener = (e) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function handleFeed() {
      // Skip fetch if feed is already loaded and no filters changed
      if (feed.length > 0 && filters.appliedFilters.length === 0 && !isFiltered) return;

      setLoading(true);
      setError(null);

      try {
        let res;

        if (filters.appliedFilters.length > 0) {
          const skillsQuery = filters.appliedFilters.join(",");
          res = await api.get(
            `/api/recommendations/filtered-by-skills?skills=${encodeURIComponent(
              skillsQuery
            )}&limit=50`,
            { signal }
          );
          setIsFiltered(true);
        } else {
          res = await api.get("/feed", {
            signal,
          });
          setIsFiltered(false);
        }

        dispatch(addFeed(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
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
    return () => controller.abort();
  }, [dispatch, filters.appliedFilters]);

  const currentDev = feed.length > 0 ? feed[0] : null;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in-up">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <h1 className="text-xl font-bold gradient-text mb-2">
            Finding Developers...
          </h1>
          <p className="text-slate-500 text-sm">
            Matching the best profiles for you
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold gradient-text mb-2">
            Error Loading Feed
          </h1>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 btn-gradient rounded-xl text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (feed.length === 0) {
    return (
      <div className="flex items-center justify-center h-full relative">
        {/* Filter button */}
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-5 z-10 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {filters.appliedFilters.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold">
              {filters.appliedFilters.length}
            </span>
          )}
        </button>

        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-4 animate-float">🔍</div>
          <h1 className="text-xl font-bold gradient-text mb-2">
            {isFiltered ? "No Matches Found" : "No More Profiles"}
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            {isFiltered
              ? "No developers match your filters. Try different skills."
              : "Check back later for new developers!"}
          </p>
        </div>

        {/* Filter modal */}
        {showFilters && (
          <FilterPanel onClose={() => setShowFilters(false)} />
        )}
      </div>
    );
  }

  // ── Main 3-column layout ──
  return (
    <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden relative">
      {/* Filter button — top right */}
      <button
        onClick={() => setShowFilters(true)}
        className="absolute top-3 right-3 sm:top-4 sm:right-5 z-10 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5 hover:border-white/10 transition-all"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filters
        {filters.appliedFilters.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold">
            {filters.appliedFilters.length}
          </span>
        )}
      </button>

      {/* Center — Developer Card */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center min-w-0 w-full min-h-[calc(100vh-80px)] lg:min-h-0 py-4 lg:py-0">
        <DeveloperCard
          key={currentDev._id}
          user={currentDev}
          totalCount={feed.length}
          currentIndex={0}
        />

        {/* Mobile-only Details + Posts section (rendered below card on smaller screens) */}
        {!isDesktop && (
          <div className="w-full max-w-[380px] mt-6 px-3 flex flex-col gap-6 pb-20">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <DeveloperDetails user={currentDev} />
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <PostFeed userId={currentDev._id} />
          </div>
        )}
      </div>

      {/* Right — Details + Posts panel */}
      {isDesktop && (
        <div className="hidden lg:flex w-[360px] xl:w-[400px] flex-col border-l border-white/5 h-full">
          <div className="flex-1 overflow-y-auto p-5">
            {/* Developer details */}
            <DeveloperDetails user={currentDev} />

            {/* Divider */}
            <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Posts section */}
            <PostFeed userId={currentDev._id} />
          </div>
        </div>
      )}

      {/* Filter modal */}
      {showFilters && (
        <FilterPanel onClose={() => setShowFilters(false)} />
      )}

      {/* Create post modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  );
};

export default Feed;
