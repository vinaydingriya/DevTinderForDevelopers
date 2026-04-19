import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const RepoCard = ({ reference }) => {
  const [metadata, setMetadata] = useState(reference.metadata || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If metadata is missing or empty, fetch it
    if (
      reference.owner &&
      reference.repoName &&
      !metadata.url
    ) {
      fetchMetadata();
    }
  }, [reference.owner, reference.repoName]);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/chat/github/repo/${reference.owner}/${reference.repoName}`,
        { withCredentials: true }
      );
      setMetadata(res.data.data);
    } catch (e) {
      console.error("Failed to fetch repo metadata:", e);
    } finally {
      setLoading(false);
    }
  };

  const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    Java: "#b07219",
    Go: "#00add8",
    Rust: "#dea584",
    "C++": "#f34b7d",
    C: "#555555",
    Ruby: "#701516",
    PHP: "#4f5d95",
    Swift: "#fa7343",
    Kotlin: "#a97bff",
    Dart: "#00b4ab",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Vue: "#41b883",
  };

  const repoUrl = metadata.url || `https://github.com/${reference.owner}/${reference.repoName}`;

  if (loading) {
    return (
      <div className="repo-card rounded-xl p-3 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-white/5"></div>
          <div className="h-4 bg-white/5 rounded w-32"></div>
        </div>
        <div className="h-3 bg-white/5 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-white/5 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div
      className="repo-card rounded-xl p-3 cursor-pointer hover:bg-white/[0.06] transition-all duration-200 group/repo"
      onClick={() => window.open(repoUrl, "_blank")}
    >
      {/* Repo header */}
      <div className="flex items-center gap-2 mb-1.5">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
        </svg>
        <span className="text-sm font-semibold text-purple-300 group-hover/repo:text-purple-200 truncate">
          {reference.owner}/{reference.repoName}
        </span>
      </div>

      {/* Description */}
      {metadata.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2 leading-relaxed">
          {metadata.description}
        </p>
      )}

      {/* File path if present */}
      {reference.filePath && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded bg-white/[0.03] border border-white/5">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[11px] text-slate-500 font-mono truncate">
            {reference.filePath}
          </span>
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        {metadata.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: languageColors[metadata.language] || "#8b8b8b",
              }}
            ></span>
            {metadata.language}
          </span>
        )}
        {metadata.stars > 0 && (
          <span className="flex items-center gap-0.5">
            ⭐ {metadata.stars >= 1000 ? `${(metadata.stars / 1000).toFixed(1)}k` : metadata.stars}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-purple-400/60 group-hover/repo:text-purple-300 transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open
        </span>
      </div>
    </div>
  );
};

export default RepoCard;
