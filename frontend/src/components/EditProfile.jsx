/* eslint-disable react/prop-types */
import React, { useState, useRef } from "react";
import UserCard from "./UserCard";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { Camera, Upload, X } from "lucide-react";

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

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.data.firstName);
  const [lastName, setLastName] = useState(user.data?.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.data?.photoUrl);
  const [age, setAge] = useState(user.data?.age);
  const [gender, setGender] = useState(user.data?.gender);
  const [about, setAbout] = useState(user.data?.about);
  const [interests, setInterests] = useState(user.data?.interests || []);
  const [error, setError] = useState("");

  const [skills, setSkills] = useState(user.data?.skills || []);
  const [skill, setSkill] = useState('');
  const [skillError, setSkillError] = useState(null);

  const [githubUsername, setGithubUsername] = useState(user.data?.githubUsername || "");
  const [githubProfileUrl, setGithubProfileUrl] = useState(user.data?.githubProfileUrl || "");

  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setPhotoUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.photoUrl);
      dispatch(addUser(res.data.data));
      setPhotoPreview(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Photo upload failed");
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoUpload(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSkillError("");

    const data = {
      firstName,
      lastName,
      photoUrl,
      age,
      about,
      skills,
      interests,
      githubUsername: githubUsername || undefined,
      githubProfileUrl: githubProfileUrl || undefined,
    };
    if (gender?.length) {
      data['gender'] = gender;
    }
    try {
      const res = await api.patch("/profile/edit",
        data);
      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong.");
    }
  };

  function addSkill() {
    if (skill.length === 0 || skill.length > 25)
      setSkillError("Skill must be of 1-25 characters");
    else if (skills.includes(skill)) setSkillError("Skills must be unique");
    else if (skills.length == 25)
      setSkillError("You cannot put more than 25 skills");
    else {
      setSkillError(null);
      setSkills(skills.concat(skill));
      setSkill("");
    }
  }

  function deleteSkill(index) {
    setSkillError("");
    const tempSkills = [...skills.slice(0, index), ...skills.slice(index + 1)];
    setSkills(tempSkills);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all";

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto py-6 sm:py-8 px-3 sm:px-6 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Edit Form Column ── */}
            <div className="w-full lg:flex-1 lg:max-w-lg">
              <div className="glass-card rounded-2xl p-6 sm:p-8 gradient-border">
                <form onSubmit={(e) => saveProfile(e)} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="text-3xl mb-2">✏️</div>
                    <h2 className="text-2xl font-bold gradient-text">Edit Profile</h2>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      className={inputClass}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      className={inputClass}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  {/* ── Profile Photo Upload ── */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-2 block">Profile Photo</label>
                    <div
                      className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                        dragOver
                          ? "border-purple-400 bg-purple-500/10"
                          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e.target.files[0])}
                      />

                      <div className="flex items-center gap-4 p-4">
                        {/* Current photo preview */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={photoPreview || photoUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10"
                            onError={(e) => {
                              e.target.src = "https://geographyandyou.com/images/user-profile.png";
                            }}
                          />
                          <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                          {photoUploading && (
                            <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 font-medium">
                            {photoUploading ? "Uploading..." : "Click or drag to upload"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP • Max 5MB</p>
                        </div>

                        <Upload className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Toggle URL input for advanced users */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowUrlInput(!showUrlInput); }}
                      className="text-[10px] text-slate-500 hover:text-purple-400 mt-1.5 transition-colors"
                    >
                      {showUrlInput ? "Hide URL input" : "Or enter URL manually"}
                    </button>
                    {showUrlInput && (
                      <input
                        type="text"
                        value={photoUrl}
                        className={inputClass + " mt-1.5"}
                        placeholder="https://example.com/photo.jpg"
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1 block">Age</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={age || ""}
                        onChange={(e) => setAge(Number(e.target.value) || "")}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1 block">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Choose</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">About</label>
                    <input
                      type="text"
                      value={about}
                      className={inputClass}
                      onChange={(e) => setAbout(e.target.value)}
                    />
                  </div>

                  {/* Interests section */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-3 block">Select Your Interests</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INTERESTS_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (interests.includes(interest)) {
                              setInterests(interests.filter(i => i !== interest));
                            } else {
                              setInterests([...interests, interest]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            interests.includes(interest)
                              ? "bg-pink-500 text-white border border-pink-400"
                              : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50"
                          }`}
                        >
                          {interests.includes(interest) && <span className="mr-1">✓</span>}
                          {interest}
                        </button>
                      ))}
                    </div>
                    {interests.length > 0 && (
                      <p className="text-xs text-slate-400 mt-2">
                        Selected: {interests.length}
                      </p>
                    )}
                  </div>

                  {/* Skills section */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">Skills</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. React, Node.js"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl btn-gradient text-sm whitespace-nowrap"
                        onClick={addSkill}
                      >
                        + Add
                      </button>
                    </div>
                    {skillError && (
                      <p className="text-red-400 text-xs mt-1">{skillError}</p>
                    )}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((s, i) => (
                          <React.Fragment key={s}>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
                              {s}
                              <button
                                type="button"
                                onClick={() => deleteSkill(i)}
                                className="hover:text-red-400 transition-colors ml-0.5"
                              >
                                ×
                              </button>
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* GitHub section */}
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <label className="text-xs text-slate-400 font-medium mb-3 block flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub Integration
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">GitHub Username</label>
                        <input
                          type="text"
                          value={githubUsername}
                          className={inputClass}
                          placeholder="e.g. octocat"
                          onChange={(e) => {
                            const val = e.target.value;
                            setGithubUsername(val);
                            if (val) {
                              setGithubProfileUrl(`https://github.com/${val}`);
                            } else {
                              setGithubProfileUrl("");
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">GitHub Profile URL</label>
                        <input
                          type="text"
                          value={githubProfileUrl}
                          className={inputClass}
                          placeholder="https://github.com/username"
                          onChange={(e) => setGithubProfileUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <button className="w-full py-3 rounded-xl btn-gradient text-base font-semibold mt-2">
                    Save Profile →
                  </button>
                </form>
              </div>
            </div>

            {/* ── Live Preview Column (sticky, not fixed) ── */}
            <div className="hidden lg:block lg:w-80 xl:w-[340px] flex-shrink-0">
              <div className="sticky top-8">
                <p className="text-sm text-slate-400 font-medium text-center mb-3">Live Preview</p>
                {user && <UserCard userData={user} showButton={false} />}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl rounded-xl px-6 py-3 text-emerald-300 font-medium shadow-lg">
            ✓ Profile saved successfully
          </div>
        </div>
      )}
    </>
  );

};
export default EditProfile;
