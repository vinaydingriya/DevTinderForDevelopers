import api from "../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addRequests, removeRequest } from "../utils/requestsSlice";
import { Link } from "react-router-dom";

const Requests = () => {
  const dispatch = useDispatch();

  const connectionRequests = useSelector((store) => store.requests);

  async function reviewRequest(_id, status) {
    try {
      await api.post(`/request/review/${status}/${_id}`);
      dispatch(removeRequest(_id));
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchRequests() {
      try {
        const res = await api.get("/user/requests/received", {
          signal,
        });
        dispatch(addRequests(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
          console.log(e);
        }
      }
    }
    fetchRequests();

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  if (connectionRequests.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-float">📩</div>
        <h1 className="text-2xl font-bold gradient-text mb-2">No Requests</h1>
        <p className="text-slate-400 text-sm">
          You&apos;re all caught up! No pending requests.
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-center gradient-text mb-8">
        Connection Requests
      </h1>
      <div className="space-y-4">
        {connectionRequests.map((r, index) => {
          const { _id: userId, firstName, lastName, photoUrl, about, skills } = r.fromUserId;
          return (
            <div
              key={r._id}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 gradient-border hover:scale-[1.01] transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Clickable developer profile area */}
              <Link
                to={`/user/${userId}`}
                className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0 group-hover:ring-purple-500/60 transition-all duration-300">
                  <img
                    src={photoUrl}
                    alt={firstName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg truncate group-hover:text-purple-300 transition-colors duration-200">
                    {firstName + (lastName ? " " + lastName : "")}
                  </h3>
                  {about && (
                    <p className="text-slate-400 text-xs truncate mt-0.5">
                      {about}
                    </p>
                  )}
                  {skills && skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-md text-[10px] font-medium border border-blue-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="text-slate-500 text-[10px] self-center">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                <button
                  className="px-4 py-2 rounded-xl btn-success-gradient text-sm font-medium"
                  onClick={() => reviewRequest(r._id, "accepted")}
                >
                  ✓ Accept
                </button>
                <button
                  className="px-4 py-2 rounded-xl btn-danger-gradient text-sm font-medium"
                  onClick={() => reviewRequest(r._id, "rejected")}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;

