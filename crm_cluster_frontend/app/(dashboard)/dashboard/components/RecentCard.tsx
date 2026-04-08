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
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Get events from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent_activity");
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  // Set events to localStorage
  useEffect(() => {
    localStorage.setItem("recent_activity", JSON.stringify(events));
  }, [events]);

  // Connect to socket
  useEffect(() => {
    const socket = getSocket();
    console.log("Socket Connected");

    socket.onmessage = (event) => {
      console.log("Get a messsage from the server: ", event);

      const parsed = JSON.parse(event.data);
      const newEvent = {
        event: parsed.event,
        payload: parsed.payload,
        timestamp: new Date(),
      };

      setEvents((prev) => [...prev, newEvent]);
    };
  }, []);

  return (
    <div
      className="min-h-full w-full bg-[#00d4ff1a] rounded-md border-2 border-[#00d4ff80] 
      shadow-[0_0_20px_rgba(0,212,255,0.3)] shadow-md flex flex-col  backdrop-blur-sm p-6 text-white/70 gap-3"
    >
      <h2 className="text-center mb-3 text-lg font-bold">Recent Activity</h2>

      {events.map((event, i) => (
        <ActivityItem key={i} event={event} i={i} />
      ))}
    </div>
  );
};

export default RecentCard;
