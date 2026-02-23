import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {

  const [feeds, setfeeds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFeeds = async () => {
    setfeeds(dummyPostsData)
    setLoading(false)
  }

  useEffect(() =>{
    fetchFeeds()
  },[])
  return !loading ? (
    <div className="h-full w-full overflow-y-auto no-scrollbar py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto flex items-start gap-6 xl:gap-8">
        {/* Stories and post */}
        <div className="w-full max-w-2xl flex-1 min-w-0">
          <StoriesBar />
          <div className="p-4 space-y-6">
            {feeds.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="max-xl:hidden sticky top-6">
          <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
            <h3 className="text-slate-800 font-semibold">Sponsored</h3>
            <img src={assets.sponsored_img} alt="" className="w-full h-40 object-cover rounded-md" />
            <p className="text-slate-600">Email marketing</p>
            <p className="text-slate-400">Super pandak Chargeeeee</p>
          </div>
          <RecentMessages />
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Feed
