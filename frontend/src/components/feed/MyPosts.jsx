import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { Heart, Trash2, ImageIcon, Film, Loader2 } from "lucide-react";

const MyPostCard = ({ post, onDelete }) => {
  const { text, mediaUrl, mediaType, likes, createdAt, _id } = post;

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(_id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
      {/* Meta row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500">{timeAgo(createdAt)}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          Delete
        </button>
      </div>

      {/* Text */}
      {text && (
        <p className="text-sm text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">
          {text}
        </p>
      )}

      {/* Media */}
      {mediaUrl && mediaType === "image" && (
        <div className="rounded-xl overflow-hidden mb-3 border border-white/5">
          <img
            src={mediaUrl}
            alt="Post media"
            className="w-full max-h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}
      {mediaUrl && mediaType === "video" && (
        <div className="rounded-xl overflow-hidden mb-3 border border-white/5">
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-48"
            preload="metadata"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" /> {likes?.length || 0} likes
        </span>
        {mediaType && (
          <span className="flex items-center gap-1">
            {mediaType === "image" ? (
              <ImageIcon className="w-3 h-3" />
            ) : (
              <Film className="w-3 h-3" />
            )}
            {mediaType}
          </span>
        )}
      </div>
    </div>
  );
};

const MyPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/posts/me?page=${pageNum}&limit=10`,
          { withCredentials: true }
        );
        if (pageNum === 1) {
          setPosts(res.data.data);
        } else {
          setPosts((prev) => [...prev, ...res.data.data]);
        }
        setHasMore(res.data.pagination.hasMore);
      } catch (e) {
        console.error("Failed to load posts:", e);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e) {
      console.error("Failed to delete post:", e);
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <span className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-2 opacity-40">📝</div>
        <p className="text-xs text-slate-500 mb-1">No posts yet</p>
        <p className="text-[10px] text-slate-600">
          Share your progress, problems, or wins!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <MyPostCard key={post._id} post={post} onDelete={handleDelete} />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
};

export default MyPosts;
