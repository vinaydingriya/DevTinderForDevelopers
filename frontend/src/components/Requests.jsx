import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addRequests, removeRequest } from "../utils/requestsSlice";

const Requests = () => {
  const dispatch = useDispatch();

  const connectionRequests = useSelector((store) => store.requests);

  async function reviewRequest(_id, status) {
    try {
      await axios.post(
        BASE_URL + `/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchRequests() {
      if (connectionRequests.length > 0) return;
      try {
        const res = await axios.get(BASE_URL + "/user/requests/received", {
          withCredentials: true,
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
  }, [dispatch, connectionRequests.length]);

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
          const { firstName, lastName, photoUrl } = r.fromUserId;
          return (
            <div
              key={r._id}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 gradient-border hover:scale-[1.01] transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0">
                <img
                  src={photoUrl}
                  alt={firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate">
                  {firstName + (lastName ? " " + lastName : "")}
                </h3>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
