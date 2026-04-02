import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Password = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const updatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length > 100 || newPassword.length < 8) {
      setError("Password length must be 8-100 characters.");
    } else if (newPassword !== verifyPassword) {
      setError("The passwords do not match.");
    } else {
      setError("");
      try {
        await axios.patch(
          BASE_URL + "/profile/password",
          {
            oldPassword,
            newPassword,
          },
          { withCredentials: true }
        );
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (e) {
        setError(e?.response?.data?.error || "Something went wrong.");
      }
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all";

  return (
    <>
      <div className="w-full max-w-md mx-auto py-10 px-4 animate-fade-in-up">
        <div className="glass-card rounded-2xl p-8 gradient-border">
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔐</div>
              <h2 className="text-2xl font-bold gradient-text">
                Update Password
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Keep your account secure
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                className={inputClass}
                placeholder="••••••••"
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                className={inputClass}
                placeholder="••••••••"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={verifyPassword}
                className={inputClass}
                placeholder="••••••••"
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-red-400 text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            <button className="w-full py-3 rounded-xl btn-gradient text-base font-semibold mt-2">
              Update Password →
            </button>
          </form>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl rounded-xl px-6 py-3 text-emerald-300 font-medium shadow-lg">
            ✓ Password updated successfully
          </div>
        </div>
      )}
    </>
  );
};
export default Password;
