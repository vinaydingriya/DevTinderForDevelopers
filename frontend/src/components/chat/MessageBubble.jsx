import RepoCard from "./RepoCard";

const REPO_MENTION_REGEX = /@([a-zA-Z0-9\-_.]+)\/([a-zA-Z0-9\-_.]+)(\/[a-zA-Z0-9\-_./]*)?/g;

const MessageBubble = ({ message, isSelf }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return (
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "delivered":
        return (
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 7l4 4" />
          </svg>
        );
      case "read":
        return (
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 7l4 4" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render message text with repo mentions highlighted
  const renderText = (text) => {
    if (!text) return null;

    // Decode HTML entities for rendering
    const decoded = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");

    const parts = [];
    let lastIndex = 0;
    let match;

    REPO_MENTION_REGEX.lastIndex = 0;

    while ((match = REPO_MENTION_REGEX.exec(decoded)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {decoded.slice(lastIndex, match.index)}
          </span>
        );
      }
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono cursor-pointer hover:bg-purple-500/30 transition-colors"
          onClick={() => window.open(`https://github.com/${match[1]}/${match[2]}${match[3] || ""}`, "_blank")}
        >
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < decoded.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{decoded.slice(lastIndex)}</span>
      );
    }

    return parts.length > 0 ? parts : decoded;
  };

  const senderName =
    typeof message.senderId === "object"
      ? message.senderId.firstName
      : "";

  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-[75%] ${isSelf ? "order-1" : ""}`}>
        {/* Sender name (for received messages) */}
        {!isSelf && senderName && (
          <p className="text-[10px] text-slate-500 mb-0.5 ml-1">{senderName}</p>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isSelf
              ? "bg-gradient-to-br from-purple-600/80 to-pink-600/60 text-white rounded-br-md"
              : "bg-white/[0.06] text-slate-200 border border-white/5 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {renderText(message.text)}
          </p>
        </div>

        {/* Repo preview cards */}
        {message.repoReferences?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.repoReferences.map((ref, i) => (
              <RepoCard key={i} reference={ref} />
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isSelf ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-slate-600">
            {formatTime(message.createdAt)}
          </span>
          {isSelf && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
