import axios from 'axios'

import { BASE_URL } from "../utils/constants";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { addConnections } from '../utils/connectionsSlice';

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector(store => store.connections)

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchConnections() {
      if (connections.length > 0) return;

      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
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
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0">
              <img
                src={connection.photoUrl}
                alt={connection.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg truncate">
                {connection.firstName +
                  (connection.lastName ? " " + connection.lastName : "")}
              </h3>
              {connection.about && (
                <p className="text-slate-400 text-sm truncate mt-0.5">
                  {connection.about}
                </p>
              )}
            </div>
            <div className="text-2xl flex-shrink-0">💬</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Connections