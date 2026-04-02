import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store.feed);

  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function handleFeed() {
      if (feed.length > 0) return;
      try {
        const res = await axios.get(BASE_URL + "/feed", {
          withCredentials: true,
          signal
        });
        dispatch(addFeed(res.data.data));
      } catch (e) {
        if (e.code !== "ERR_CANCELED" && e.code !== "ECONNABORTED") {
          console.log(e);
        }
      }
    }
    handleFeed();

    return () => {
      controller.abort();
    }
  }, [dispatch, feed.length]);

  if (feed.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-float">🔍</div>
        <h1 className="text-2xl font-bold gradient-text mb-2">No More Profiles</h1>
        <p className="text-slate-400 text-sm">Check back later for new developers!</p>
      </div>
    );

  return (
    <div className="py-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-center gradient-text mb-8">
        Discover Developers
      </h1>
      <div className="flex justify-center">
        <UserCard userData={feed[0]} />
      </div>
    </div>
  );
};

export default Feed;
