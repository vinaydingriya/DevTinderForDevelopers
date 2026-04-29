import { useDispatch, useSelector } from "react-redux";
import {
  toggleSkill,
  resetFilters,
  applyFilters,
} from "../utils/filterSlice";
import { useState } from "react";
import { X, Search } from "lucide-react";

const INTERESTS_OPTIONS = [
  "AI",
  "Web Dev",
  "Mobile Dev",
  "Blockchain",
  "Cloud",
  "DevOps",
  "Data Science",
  "Backend",
  "Frontend",
  "Full Stack",
  "Open Source",
  "Startups",
];

const FilterPanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const filters = useSelector((store) => store.filters);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      dispatch(toggleSkill(skillInput.trim()));
      setSkillInput("");
    }
  };

  const handleSearch = () => {
    if (filters.skills.length > 0) {
      dispatch(applyFilters());
      onClose?.();
    }
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSkillInput("");
    onClose?.();
  };

  const hasActiveFilters = filters.skills.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl glass-card rounded-2xl gradient-border animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-400" />
            Filter Developers
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Selected skills */}
          {filters.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Selected Skills ({filters.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-200 rounded-lg text-xs font-medium border border-blue-500/30 flex items-center gap-2 hover:bg-blue-500/30 transition"
                  >
                    ✓ {skill}
                    <button
                      onClick={() => dispatch(toggleSkill(skill))}
                      className="hover:text-blue-100 font-bold text-sm leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom skill */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Add Custom Skill
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="e.g., React, Node.js, Python..."
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none input-glow transition-all"
              />
              <button
                onClick={handleAddSkill}
                disabled={!skillInput.trim()}
                className="px-4 py-2.5 btn-gradient rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quick add from interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Quick Add
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const isSelected = filters.skills.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => dispatch(toggleSkill(interest))}
                    className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                        : "bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-200"
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
          >
            Clear All
          </button>
          <button
            onClick={handleSearch}
            disabled={!hasActiveFilters}
            className="px-5 py-2 btn-gradient rounded-xl text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Search ({filters.skills.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
