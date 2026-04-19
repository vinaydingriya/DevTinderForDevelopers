import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const SharedResourcesPanel = ({ roomId, onClose }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [roomId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/chat/room/${roomId}/resources`, {
        withCredentials: true,
      });
      setResources(res.data.data || []);
    } catch (e) {
      console.error("Failed to fetch resources:", e);
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
  };

  return (
    <div className="w-72 border-l border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Shared Resources
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Resource List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] animate-pulse">
                <div className="h-3 bg-white/5 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-white/5 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-slate-500 text-xs">
              No shared resources yet.
            </p>
            <p className="text-slate-600 text-[10px] mt-1">
              Share repos using @owner/repo in chat
            </p>
          </div>
        ) : (
          resources
            .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
            .map((resource, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group"
                onClick={() => window.open(resource.url || `https://github.com/${resource.owner}/${resource.repoName}`, "_blank")}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-300 group-hover:text-purple-200 truncate">
                    {resource.owner}/{resource.repoName}
                  </span>
                </div>
                {resource.filePath && (
                  <p className="text-[10px] text-slate-600 font-mono truncate mb-1">
                    📄 {resource.filePath}
                  </p>
                )}
                {resource.metadata?.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {resource.metadata.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                  {resource.metadata?.language && (
                    <span className="flex items-center gap-0.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: languageColors[resource.metadata.language] || "#8b8b8b" }}
                      ></span>
                      {resource.metadata.language}
                    </span>
                  )}
                  {resource.metadata?.stars > 0 && (
                    <span>⭐ {resource.metadata.stars}</span>
                  )}
                  <span className="ml-auto text-slate-700">
                    {new Date(resource.sharedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default SharedResourcesPanel;
