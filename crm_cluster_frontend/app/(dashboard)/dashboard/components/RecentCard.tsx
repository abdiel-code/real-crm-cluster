"use client";

import { useEffect, useState } from "react";
import ActivityItem from "./ActivityItem";
import { getSocket } from "../../lib/socket";

export type ActivityEvent = {
  event: string;
  payload: any;
  timestamp: Date;
};

const RecentCard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recent_activity");
      try {
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isConnected, setIsConnected] = useState(false);

  // Set events to localStorage
  useEffect(() => {
    localStorage.setItem("recent_activity", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Connect to socket
  useEffect(() => {
    const socket = getSocket();

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);

    const handleMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const newEvent = {
          event: parsed.event,
          payload: parsed.payload,
          timestamp: new Date(),
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 20));
      } catch (error) {
        console.error("Socket message parsing error:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
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
