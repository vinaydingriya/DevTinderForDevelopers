import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { Heart, Trash2, ImageIcon, Film, MessageSquare } from "lucide-react";

const PostCard = ({ post, currentUserId, onLike, onDelete }) => {
  const { userId: author, text, mediaUrl, mediaType, likes, createdAt, _id } = post;
  const isLiked = likes?.some((id) => id === currentUserId || id?._id === currentUserId);
  const isMine = (author?._id || author) === currentUserId;

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

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0">
          <img
            src={author?.photoUrl}
            alt={author?.firstName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {author?.firstName} {author?.lastName || ""}
          </p>
          <p className="text-[10px] text-slate-500">{timeAgo(createdAt)}</p>
        </div>
        {isMine && (
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
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
            className="w-full max-h-64 object-cover"
            loading="lazy"
          />
        </div>
      )}
      {mediaUrl && mediaType === "video" && (
        <div className="rounded-xl overflow-hidden mb-3 border border-white/5">
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-64"
            preload="metadata"
          />
        </div>
      )}

      {/* Like button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onLike(_id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isLiked
              ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
              : "bg-white/[0.03] text-slate-500 hover:text-pink-400 hover:bg-pink-500/10 border border-white/5"
          }`}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth={2}
          />
          {likes?.length || 0}
        </button>
      </div>
    </div>
  );
};

const PostFeed = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentUser = useSelector((store) => store.user);
  const currentUserId = currentUser?.data?._id;

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await api.get(`/posts/user/${userId}?page=${pageNum}&limit=10`);
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

  // Reset and fetch when developer changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPosts([]);
    fetchPosts(1);
  }, [userId, fetchPosts]);

  const handleLike = async (postId) => {
    try {
      const res = await api.patch(`/posts/${postId}/like`,
        {});
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const newLikes = res.data.data.liked
            ? [...(p.likes || []), currentUserId]
            : (p.likes || []).filter((id) => id !== currentUserId && id?._id !== currentUserId);
          return { ...p, likes: newLikes };
        })
      );
    } catch (e) {
      console.error("Failed to like post:", e);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
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

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" /> Recent Posts
          {posts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-500">
              {posts.length}
            </span>
          )}
        </h3>
      </div>

      {/* Posts list */}
      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <span className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2 opacity-40">📝</div>
          <p className="text-xs text-slate-500">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
            >
              {loading ? "Loading..." : "Load more posts"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
