"use client";

import { useEffect, useState } from "react";
import ActivityItem from "./ActivityItem";
import { useSocket } from "../../lib/SocketContext";

const RecentCard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { events, isConnected } = useSocket();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-full max-h-[400px] w-full bg-cyan-500/10 rounded-md border-2 border-cyan-500/80 p-6 shadow-cyan-500/20 shadow-md flex flex-col backdrop-blur-sm" />
    );
  }

  return (
    <div
      className="min-h-full max-h-[400px] overflow-y-auto w-full bg-cyan-500/10 rounded-md border-2 border-cyan-500/80 
      shadow-cyan-500/20 shadow-md flex flex-col backdrop-blur-sm p-6 text-white/70 gap-3"
    >
      <h2 className="text-center mb-3 text-lg font-bold flex items-center justify-center gap-2">
        <span
          className={`rounded-full w-2 h-2 inline-block ${
            isConnected
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
              : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          }`}
        />
        Recent Activity
      </h2>

      {events.length === 0 ? (
        <p className="text-white/50 italic text-sm text-center py-4">
          No recent activity
        </p>
      ) : (
        events
          .slice(0, 5)
          .map((event, i) => <ActivityItem key={i} event={event} i={i} />)
      )}
    </div>
  );
};

export default RecentCard;
