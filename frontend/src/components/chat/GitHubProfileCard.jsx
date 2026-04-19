import { useState, useEffect } from "react";
import axios from "axios";

const GitHubProfileCard = ({ username }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });
      setProfile(res.data);
    } catch (e) {
      console.error("Failed to fetch GitHub profile:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/5"></div>
          <div>
            <div className="h-4 bg-white/5 rounded w-20 mb-1"></div>
            <div className="h-3 bg-white/5 rounded w-16"></div>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded w-full"></div>
        <div className="h-3 bg-white/5 rounded w-3/4"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 text-xs">Could not load GitHub profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Avatar and name */}
      <div className="flex items-center gap-3">
        <img
          src={profile.avatar_url}
          alt={profile.login}
          className="w-12 h-12 rounded-full ring-2 ring-white/10"
        />
        <div>
          <h4 className="text-sm font-semibold text-white">{profile.name || profile.login}</h4>
          <p className="text-xs text-slate-500">@{profile.login}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-slate-400 leading-relaxed">{profile.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-sm font-bold text-white">{profile.public_repos}</p>
          <p className="text-[10px] text-slate-500">Repos</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-sm font-bold text-white">{profile.followers}</p>
          <p className="text-[10px] text-slate-500">Followers</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-sm font-bold text-white">{profile.following}</p>
          <p className="text-[10px] text-slate-500">Following</p>
        </div>
      </div>

      {/* Extra info */}
      <div className="space-y-1.5 text-xs">
        {profile.company && (
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {profile.company}
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {profile.location}
          </div>
        )}
      </div>

      {/* Open on GitHub button */}
      <a
        href={profile.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        View on GitHub
      </a>
    </div>
  );
};

export default GitHubProfileCard;
