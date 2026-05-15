import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import PostFeed from "./feed/PostFeed";
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Code2,
  Sparkles,
  BarChart3,
  Calendar,
  Crown,
  Mail,
} from "lucide-react";

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const ConnectionProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await api.get(`/user/profile/${userId}`);
        setUser(res.data.data);
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <span className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin inline-block mb-4" />
          <p className="text-slate-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold gradient-text mb-2">Profile Not Found</h1>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Link to="/connections" className="px-5 py-2 btn-gradient rounded-xl text-sm inline-block">
            ← Back to Connections
          </Link>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in-up">
        {/* Back button */}
        <Link
          to="/connections"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Connections
        </Link>

        {/* Profile Hero */}
        <div className="glass-card rounded-2xl overflow-hidden gradient-border mb-6">
          {/* Cover / Photo area */}
          <div className="relative h-48 bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-cyan-500/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgMTAgMCBMIDIwIDEwIEwgMTAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-50" />

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Link
                to={`/chat?userId=${user._id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 border border-white/10 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Link>
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-[#0f1729] shadow-xl">
                <img
                  src={user.photoUrl}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="pt-16 pb-6 px-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.firstName} {user.lastName || ""}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {user.age && user.gender && (
                    <span className="text-sm text-slate-400">
                      {user.age} · {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                    </span>
                  )}
                  {user.isPremium && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/20">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" /> Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* About */}
            {user.about && (
              <div className="glass-card rounded-2xl p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> About
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{user.about}</p>
              </div>
            )}

            {/* GitHub */}
            {user.githubUsername && (
              <a
                href={user.githubProfileUrl || `https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl p-5 gradient-border flex items-center gap-4 hover:scale-[1.01] transition-all group block"
              >
                <GithubIcon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                    {user.githubUsername}
                  </p>
                  <p className="text-[10px] text-slate-500">View GitHub Profile →</p>
                </div>
              </a>
            )}

            {/* Contact */}
            {user.email && (
              <div className="glass-card rounded-2xl p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Mail className="w-3.5 h-3.5" /> Contact
                </h3>
                <p className="text-sm text-slate-300">{user.email}</p>
              </div>
            )}
          </div>

          {/* Right column — Skills, Interests, Posts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="glass-card rounded-2xl p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Code2 className="w-3.5 h-3.5" /> Skills ({user.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-500/15 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="glass-card rounded-2xl p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-pink-500/15 text-pink-300 rounded-lg text-xs font-medium border border-pink-500/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            <div className="glass-card rounded-2xl p-5 gradient-border">
              <PostFeed userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionProfile;
