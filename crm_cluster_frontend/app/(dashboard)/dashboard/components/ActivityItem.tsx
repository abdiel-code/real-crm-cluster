import { motion } from "motion/react";

type AcctivityProps = {
  event: any;
  i: number;
};

const ActivityItem = ({ event, i }: AcctivityProps) => {
  const getActivityLabel = (event: any, payload: any) => {
    const parts = event.event?.split("_") || ["Unknown", "Event"];
    const section =
      parts[0]?.charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const action =
      parts[1]?.charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    let target = payload?.name || payload?.title || payload?.first_name;

    return { section, action, target };
  };

  const label = getActivityLabel(event, event.payload);
  const section = label?.section;
  const action = label?.action;
  const target = label?.target;

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 + i / 10, duration: 0.5 }}
      className="w-full rounded-md border-2  border-cyan-500/80
      shadow-cyan-500/20 shadow-md flex flex-col backdrop-blur-sm p-3 text-white/70"
    >
      <div className="flex items-center">
        <p className="text-sm font-medium">
          {getRelativeTime(event.timestamp)}
        </p>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent ml-4"></div>
      </div>
      <div className="mt-2">
        <p>
          <span className="text-cyan-400">{action}</span>{" "}
          <span className="font-bold text-white">{section}</span>
          {target ? `: ${target}` : ""}
        </p>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
