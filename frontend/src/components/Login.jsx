import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john@gmail.com");
  const [password, setPassword] = useState("Passwo3#");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { email, password },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setError("");
        dispatch(addUser(res.data.data));
        navigate("/");
        console.clear();
      }
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.error);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setError("");
        setMessage("User added successfully!!");
      }
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-12 mb-8 px-4 animate-fade-in-up">
      <div className="glass-card rounded-2xl p-8 gradient-border">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{isLogin ? "👋" : "🚀"}</div>
          <h2 className="text-3xl font-bold gradient-text">
            {isLogin ? "Welcome Back" : "Join DevTinder"}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin
              ? "Sign in to discover amazing developers"
              : "Create an account to start connecting"}
          </p>
        </div>

        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="space-y-4"
        >
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">
                  First Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">
                  Last Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">
              📧 Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">
              🔒 Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none input-glow transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-emerald-400 text-sm text-center animate-fade-in">
              {message}
            </div>
          )}

          <button
            className="w-full py-3 rounded-xl btn-gradient text-base font-semibold mt-2 transition-all"
            onClick={isLogin ? handleLogin : handleSignup}
          >
            {isLogin ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
            onClick={() => {
              setIsLogin((value) => !value);
              setError("");
            }}
          >
            {isLogin
              ? "New to DevTinder? "
              : "Already have an account? "}
            <span className="font-semibold text-purple-400 underline decoration-purple-400/30 hover:decoration-purple-400">
              {isLogin ? "Sign up" : "Login"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
