import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { X, Image, Film, Upload, Loader2 } from "lucide-react";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const user = useSelector((store) => store.user);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (50MB)
    if (selected.size > 50 * 1024 * 1024) {
      setError("File too large. Max 50MB.");
      return;
    }

    setFile(selected);
    setError("");

    // Detect type
    const type = selected.type.startsWith("video") ? "video" : "image";
    setMediaType(type);

    // Create preview
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (file) formData.append("media", file);

      const res = await axios.post(`${BASE_URL}/posts`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      onPostCreated?.(res.data.data);
      handleClose();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setText("");
    clearFile();
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card rounded-2xl gradient-border animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Create Post</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/20">
              <img
                src={user?.data?.photoUrl}
                alt={user?.data?.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.data?.firstName} {user?.data?.lastName || ""}
              </p>
              <p className="text-[10px] text-slate-500">Share your progress, ideas, or problems</p>
            </div>
          </div>

          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? Share your coding progress, a problem you're facing, or something you learned..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none input-glow transition-all resize-none"
          />
          <div className="flex justify-end">
            <span className={`text-[10px] ${text.length > 450 ? "text-amber-400" : "text-slate-600"}`}>
              {text.length}/500
            </span>
          </div>

          {/* Media preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              {mediaType === "image" ? (
                <img src={preview} alt="Preview" className="w-full max-h-48 object-cover" />
              ) : (
                <video src={preview} className="w-full max-h-48" controls preload="metadata" />
              )}
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          {/* Media buttons */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 transition-all disabled:opacity-40"
            >
              <Image className="w-4 h-4" />
              Photo
            </button>
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "video/*";
                  fileRef.current.click();
                  fileRef.current.accept = "image/*,video/*";
                }
              }}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-white/5 transition-all disabled:opacity-40"
            >
              <Film className="w-4 h-4" />
              Video
            </button>
          </div>

          {/* Post button */}
          <button
            onClick={handleSubmit}
            disabled={(!text.trim() && !file) || uploading}
            className="px-5 py-2 rounded-xl btn-gradient text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
