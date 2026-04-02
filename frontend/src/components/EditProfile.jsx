/* eslint-disable react/prop-types */
import React, { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.data.firstName);
  const [lastName, setLastName] = useState(user.data?.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.data?.photoUrl);
  const [age, setAge] = useState(user.data?.age);
  const [gender, setGender] = useState(user.data?.gender);
  const [about, setAbout] = useState(user.data?.about);
  const [error, setError] = useState("");

  const [skills, setSkills] = useState(user.data?.skills || []);
  const [skill, setSkill] = useState('');
  const [skillError, setSkillError] = useState(null);

  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

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
    };
    if (gender?.length) {
      data['gender'] = gender;
    }
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        data,
        { withCredentials: true }
      );
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
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 py-8 px-4 w-full max-w-4xl mx-auto animate-fade-in-up">
        {/* Edit Form */}
        <div className="glass-card rounded-2xl p-8 w-full max-w-md gradient-border">
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

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Photo URL</label>
              <input
                type="text"
                value={photoUrl}
                className={inputClass}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
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

        {/* Live preview */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-slate-400 font-medium">Live Preview</p>
          {user && <UserCard userData={user} showButton={false} />}
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
