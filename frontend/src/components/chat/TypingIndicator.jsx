const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-center gap-2 pl-1">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/5">
        <div className="flex items-center gap-0.5">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" style={{ animationDelay: "0ms" }}></span>
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" style={{ animationDelay: "150ms" }}></span>
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" style={{ animationDelay: "300ms" }}></span>
        </div>
      </div>
      <span className="text-[10px] text-slate-600">{name} is typing</span>
    </div>
  );
};

export default TypingIndicator;
