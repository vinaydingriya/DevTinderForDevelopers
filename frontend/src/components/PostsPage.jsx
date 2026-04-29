import { useState } from "react";
import { useSelector } from "react-redux";
import CreatePostModal from "./feed/CreatePostModal";
import MyPosts from "./feed/MyPosts";
import { Plus } from "lucide-react";

const PostsPage = () => {
  const user = useSelector((store) => store.user);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">My Posts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Share your progress, problems, or wins with the community
            </p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Posts */}
        <div className="glass-card rounded-2xl p-6 gradient-border">
          {user?.data && (
            <MyPosts key={refreshKey} userId={user.data._id} />
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default PostsPage;
