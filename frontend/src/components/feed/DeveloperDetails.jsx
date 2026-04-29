import { MapPin, Code2, Sparkles, BarChart3 } from "lucide-react";

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const DeveloperDetails = ({ user }) => {
  if (!user) return null;

  const {
    firstName,
    lastName,
    photoUrl,
    about,
    age,
    gender,
    skills,
    interests,
    score,
    matchMetrics,
    githubUsername,
  } = user;

  const matchPercent = score ? (score * 100).toFixed(0) : null;

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-purple-500/20 flex-shrink-0">
          <img
            src={photoUrl}
            alt={firstName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white truncate">
            {firstName} {lastName || ""}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {age && gender && (
              <span className="text-xs text-slate-400">
                {age} · {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </span>
            )}
            {matchPercent && (
              <span className="text-xs font-bold text-purple-400">
                {matchPercent}% match
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {about && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> About
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{about}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5" /> Skills ({skills.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/20 hover:bg-blue-500/25 transition"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {interests && interests.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" /> Interests
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-pink-500/15 text-pink-300 rounded-lg text-xs font-medium border border-pink-500/20 hover:bg-pink-500/25 transition"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compatibility bars */}
      {matchMetrics && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <BarChart3 className="w-3.5 h-3.5" /> Compatibility
          </h3>
          <div className="space-y-3">
            {matchMetrics.skillSimilarity !== undefined && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">Skills</span>
                  <span className="text-xs font-bold text-blue-400">
                    {matchMetrics.skillSimilarity}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${matchMetrics.skillSimilarity}%` }}
                  />
                </div>
              </div>
            )}
            {matchMetrics.interestSimilarity !== undefined && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">Interests</span>
                  <span className="text-xs font-bold text-pink-400">
                    {matchMetrics.interestSimilarity}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${matchMetrics.interestSimilarity}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub */}
      {githubUsername && (
        <a
          href={`https://github.com/${githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
        >
          <GithubIcon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <div className="min-w-0">
            <p className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
              {githubUsername}
            </p>
            <p className="text-[10px] text-slate-500">View GitHub Profile</p>
          </div>
        </a>
      )}
    </div>
  );
};

export default DeveloperDetails;
