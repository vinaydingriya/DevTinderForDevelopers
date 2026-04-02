const Footer = () => {
  return (
    <footer className="relative py-4 px-6 text-center border-t border-white/5"
      style={{
        background: 'rgba(15, 23, 42, 0.9)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      <p className="text-sm text-slate-500">
        Copyleft © {new Date().getFullYear()} — No right reserved ·{" "}
        <span className="gradient-text font-medium">DevTinder</span>
      </p>
    </footer>
  );
}

export default Footer