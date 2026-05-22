import api from "../utils/api";


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { addConnections, removeConnection } from '../utils/connectionsSlice';

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector(store => store.connections);

  const handleRemoveConnection = async (connectionId, name) => {
    if (!window.confirm(`Are you sure you want to remove connection with ${name}? This will also delete all chat history.`)) {
      return;
    }
    try {
      await api.delete(`/connection/remove/${connectionId}`);
      dispatch(removeConnection(connectionId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to remove connection");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchConnections() {
      if (connections.length > 0) return;

      try {
        const res = await api.get("/user/connections", {
          signal,
        });
        dispatch(addConnections(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
          console.log(e);
        }
      }
    }

    fetchConnections();

    return () => {
      controller.abort();
    };
  }, [dispatch, connections.length]);

  if (connections.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-float">🤝</div>
        <h1 className="text-2xl font-bold gradient-text mb-2">No Connections Yet</h1>
        <p className="text-slate-400 text-sm">Start swiping to find your dev match!</p>
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center gradient-text mb-8">
        Your Connections
      </h2>
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <div
            key={connection._id}
            className="glass-card rounded-2xl p-4 flex items-center gap-4 gradient-border hover:scale-[1.01] transition-all duration-300 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link to={`/user/${connection._id}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0">
                <img
                  src={connection.photoUrl}
                  alt={connection.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate hover:text-purple-300 transition-colors">
                  {connection.firstName +
                    (connection.lastName ? " " + connection.lastName : "")}
                </h3>
                {connection.about && (
                  <p className="text-slate-400 text-sm truncate mt-0.5">
                    {connection.about}
                  </p>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to={`/chat?userId=${connection._id}`}
                className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                title="Chat"
              >
                💬
              </Link>
              <button
                onClick={() => handleRemoveConnection(connection._id, `${connection.firstName} ${connection.lastName || ""}`)}
                className="p-1.5 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                title="Remove Connection"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Connections