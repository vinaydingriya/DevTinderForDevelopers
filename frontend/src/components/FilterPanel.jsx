import { useDispatch, useSelector } from "react-redux";
import {
  toggleSkill,
  resetFilters,
  applyFilters,
} from "../utils/filterSlice";
import { useState } from "react";

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

const FilterPanel = () => {
  const dispatch = useDispatch();
  const filters = useSelector((store) => store.filters);
  const [skillInput, setSkillInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      dispatch(toggleSkill(skillInput.trim()));
      setSkillInput("");
    }
  };

  const handleAddSkillFromInterest = (interest) => {
    if (!filters.skills.includes(interest)) {
      dispatch(toggleSkill(interest));
    }
  };

  const handleSearch = () => {
    if (filters.skills.length > 0) {
      dispatch(applyFilters());
    }
  };

  const hasActiveFilters = filters.skills.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Toggle Button */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-white transition transform hover:scale-105 flex items-center gap-2 shadow-lg"
        >
          <span className="text-xl">{isOpen ? "🔽" : "🔎"}</span>
          {isOpen ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-red-500 rounded-full text-xs font-bold">
              {filters.skills.length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl font-semibold text-white transition transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <span className="text-xl">🔍</span>
              Search
            </button>
            <button
              onClick={() => {
                dispatch(resetFilters());
                setSkillInput("");
              }}
              className="px-4 py-2 text-sm rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition border border-red-500/30 font-semibold"
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Filter Panel - Collapsible */}
      {isOpen && (
        <div className="glass-card rounded-2xl p-6 gradient-border animate-fade-in-up">
          {/* Selected Skills Display */}
          {filters.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Selected Skills ({filters.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2 bg-blue-500/30 text-blue-200 rounded-full text-sm font-medium border border-blue-500/50 flex items-center gap-2 hover:bg-blue-500/40 transition"
                  >
                    ✓ {skill}
                    <button
                      onClick={() => dispatch(toggleSkill(skill))}
                      className="ml-1 hover:text-blue-100 font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Skill Section */}
          <div className="mb-8 pb-8 border-b border-slate-700">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Add Custom Skill
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="e.g., React, Node.js, Python, Docker..."
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button
                onClick={handleAddSkill}
                disabled={!skillInput.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-semibold transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add Skills from Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-4">
              Quick Add From Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const isSelected = filters.skills.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleAddSkillFromInterest(interest)}
                    className={`px-3 py-3 rounded-xl text-sm font-semibold transition transform hover:scale-105 ${
                      isSelected
                        ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30"
                        : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50"
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
      )}
    </div>
  );
};

export default FilterPanel;
