import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { removeUser } from "../utils/userSlice";
import { removeAllFeed } from "../utils/feedSlice";
import { removeAllRequests } from "../utils/requestsSlice";
import { removeAllConnections } from "../utils/connectionsSlice";
import { resetChat } from "../utils/chatSlice";
import {
  User,
  Shield,
  Star,
  Heart,
  Users,
  MessageCircle,
  Crown,
  Eye,
  EyeOff,
  ChevronRight,
  LogOut,
  Trash2,
  Bell,
  Palette,
  Info,
  Mail,
  Calendar,
  Zap,
  PenSquare,
} from "lucide-react";

const SettingsPage = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = user?.data;

  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ posts: 0, connections: 0, superLikes: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [postsRes, superLikesRes, connectionsRes] = await Promise.all([
          api.get("/posts/me?limit=1"),
          api.get("/superlikes/count"),
          api.get("/user/connections"),
        ]);
        setStats({
          posts: postsRes.data.pagination?.total || 0,
          connections: connectionsRes.data.data?.length || 0,
          superLikes: superLikesRes.data.count || 0,
        });
      } catch (e) {
        console.error(e);
      }
    }
    if (userData) fetchStats();
  }, [userData]);

  const updatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length > 100 || newPassword.length < 8) {
      setPwdError("Password must be 8-100 characters.");
      return;
    }
    if (newPassword !== verifyPassword) {
      setPwdError("Passwords do not match.");
      return;
    }
    setPwdError("");
    setPwdLoading(true);
    try {
      await api.patch("/profile/password",
        { oldPassword, newPassword });
      setPwdSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setVerifyPassword("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (e) {
      setPwdError(e?.response?.data?.error || "Something went wrong.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {});
      localStorage.removeItem("token");
      dispatch(removeUser());
      dispatch(removeAllConnections());
      dispatch(removeAllFeed());
      dispatch(removeAllRequests());
      dispatch(resetChat());
      navigate("/login");
    } catch (e) {
      console.log(e);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password.");
      return;
    }
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.delete("/profile/delete", { data: { password: deletePassword } });
      localStorage.removeItem("token");
      dispatch(removeUser());
      dispatch(removeAllConnections());
      dispatch(removeAllFeed());
      dispatch(removeAllRequests());
      dispatch(resetChat());
      navigate("/login");
    } catch (e) {
      setDeleteError(e?.response?.data?.error || "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all text-sm";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Page header */}
        <h1 className="text-2xl font-bold gradient-text mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-8">
          Manage your account, security, and preferences
        </p>

        <div className="space-y-5">
          {/* ═══════════════════════════════════════════ */}
          {/* ACCOUNT OVERVIEW                           */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl gradient-border overflow-hidden">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Account
              </h2>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-500/20 flex-shrink-0">
                  <img
                    src={userData?.photoUrl}
                    alt={userData?.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {userData?.firstName} {userData?.lastName || ""}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="w-3 h-3" /> {userData?.email}
                    </span>
                    {userData?.isPremium && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium border border-amber-500/20">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all flex-shrink-0"
                >
                  Edit Profile
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Member Since</p>
                  <p className="text-sm text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" /> {memberSince}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Membership</p>
                  <p className="text-sm text-slate-300 flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-slate-500" />
                    {userData?.isPremium
                      ? userData?.membershipType || "Premium"
                      : "Free"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* ACTIVITY & STATS                           */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl gradient-border overflow-hidden">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Activity
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/10">
                  <div className="text-2xl font-bold text-purple-300">{stats.connections}</div>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> Connections
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500/10">
                  <div className="text-2xl font-bold text-pink-300">{stats.posts}</div>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                    <PenSquare className="w-3 h-3" /> Posts
                  </p>
                </div>
                <button
                  onClick={() => navigate("/superlikes")}
                  className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/10 hover:border-amber-500/30 hover:from-amber-500/20 transition-all group cursor-pointer"
                >
                  <div className="text-2xl font-bold text-amber-300 group-hover:scale-110 transition-transform">
                    {stats.superLikes}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1 group-hover:text-amber-400 transition-colors">
                    <Star className="w-3 h-3" /> Super Likes
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* QUICK LINKS                                */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl gradient-border overflow-hidden">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Quick Links
              </h2>

              <div className="space-y-1">
                {[
                  { icon: Heart, label: "Connections", desc: "View your developer network", path: "/connections", color: "text-pink-400" },
                  { icon: MessageCircle, label: "Messages", desc: "Chat with your connections", path: "/chat", color: "text-blue-400" },
                  { icon: PenSquare, label: "My Posts", desc: "Manage your posts", path: "/posts", color: "text-emerald-400" },
                  { icon: Crown, label: "Premium", desc: "Upgrade for more features", path: "/premium", color: "text-amber-400" },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all group text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SECURITY                                   */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl gradient-border overflow-hidden">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Security
              </h2>

              {/* Change password toggle */}
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Change Password</p>
                  <p className="text-[10px] text-slate-500">Update your account password</p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-600 transition-transform ${
                    showPasswordSection ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Password form */}
              {showPasswordSection && (
                <form
                  onSubmit={updatePassword}
                  className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 animate-fade-in-up"
                >
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPassword}
                        className={inputClass}
                        placeholder="••••••••"
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        className={inputClass}
                        placeholder="••••••••"
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      value={verifyPassword}
                      className={inputClass}
                      placeholder="••••••••"
                      onChange={(e) => setVerifyPassword(e.target.value)}
                    />
                  </div>

                  {pwdError && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                      {pwdError}
                    </p>
                  )}
                  {pwdSuccess && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                      ✓ Password updated successfully
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="w-full py-2.5 rounded-xl btn-gradient text-sm font-semibold disabled:opacity-50"
                  >
                    {pwdLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* APP INFO                                   */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl gradient-border overflow-hidden">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> About
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-slate-400">App Version</span>
                  <span className="text-sm text-slate-300 font-mono">1.0.0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-slate-400">Built With</span>
                  <span className="text-sm text-slate-300">MERN + Socket.IO</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-slate-400">Developer</span>
                  <span className="text-sm text-slate-300">Vinay Kumar</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* DANGER ZONE                                */}
          {/* ═══════════════════════════════════════════ */}
          <div className="glass-card rounded-2xl overflow-hidden border border-red-500/10">
            <div className="p-5">
              <h2 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-4">
                Danger Zone
              </h2>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/[0.06] transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/10 text-red-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">Log Out</p>
                  <p className="text-[10px] text-slate-500">Sign out of your account</p>
                </div>
              </button>

              {/* Divider */}
              <div className="my-3 h-px bg-white/5" />

              {/* Delete Account */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/[0.06] transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                    <p className="text-[10px] text-slate-500">Permanently delete your account and all data</p>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/15 space-y-3 animate-fade-in-up">
                  <div className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Are you sure?</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        This will permanently delete your profile, connections, chats, posts, and all data. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={inputClass}
                    onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
                  />

                  {deleteError && (
                    <p className="text-red-400 text-xs">{deleteError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                        setDeleteError("");
                      }}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2 rounded-xl btn-danger-gradient text-sm font-medium disabled:opacity-50"
                    >
                      {deleteLoading ? "Deleting..." : "Delete Forever"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
