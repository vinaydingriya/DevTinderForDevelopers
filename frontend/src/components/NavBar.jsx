import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

import { removeUser } from "../utils/userSlice"
import { removeAllFeed } from "../utils/feedSlice";
import { removeAllRequests } from "../utils/requestsSlice";
import { removeAllConnections } from "../utils/connectionsSlice";

const NavBar = () => {
  const user = useSelector(store => store.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const res = await axios.post(BASE_URL + "/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(removeUser());
        dispatch(removeAllConnections());
        dispatch(removeAllFeed());
        dispatch(removeAllRequests());
        navigate("/login");
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <nav className="navbar sticky top-0 z-50 px-6 py-3 border-b border-white/5"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">💻</span>
          <span className="text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
            DevTinder
          </span>
        </Link>
      </div>
      {user?.data && (
        <div className="flex-none gap-3 flex items-center">
          <div className="dropdown dropdown-end">
            <span className="text-sm text-slate-300 mr-2 hidden sm:inline">
              Welcome, <span className="font-semibold text-purple-400">{user.data.firstName}</span>
            </span>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar ring-2 ring-purple-500/30 hover:ring-purple-500/60 transition-all"
            >
              <div className="w-10 rounded-full">
                <img alt="" src={user.data?.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-3 w-56 rounded-xl glass-card"
            >
              <li>
                <Link to="/profile" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>👤</span> Profile
                </Link>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>🔥</span> Feed
                </Link>
              </li>
              <li>
                <Link to="/connections" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>🤝</span> Connections
                </Link>
              </li>
              <li>
                <Link to="/requests" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>📩</span> Requests
                </Link>
              </li>
              <li>
                <Link to="/password" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>🔒</span> Update Password
                </Link>
              </li>
              <li>
                <Link to="/premium" className="flex items-center gap-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <span>💎</span> Premium
                </Link>
              </li>
              <div className="divider my-1 before:bg-white/5 after:bg-white/5"></div>
              <li>
                <Link onClick={handleLogout} className="flex items-center gap-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                  <span>🚪</span> Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar