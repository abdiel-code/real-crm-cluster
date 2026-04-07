"use client";

import { useState } from "react";
import ActivityItem from "./ActivityItem";

export type ActivityEvent = {
  event: string;
  payload: any;
  timestamp: Date;
};

const RecentCard = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      event: "BUSINESS_CREATED",
      payload: { id: 1, name: "John" },
      timestamp: new Date("01/04/1998"),
    },

    {
      event: "ACCOUNT_DELETED",
      payload: { id: 2, name: "John" },
      timestamp: new Date("01/04/1998"),
    },
  ]);

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
