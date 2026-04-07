import { motion } from "motion/react";

type AcctivityProps = {
  event: any;
  i: number;
};

const ActivityItem = ({ event, i }: AcctivityProps) => {
  const getName = (event: string, payload: any): string => {
    console.log(`event name ${event} payload ${payload}`);
    if (event.includes("CONTACT"))
      return `${payload?.first_name} ${payload?.last_name}`;
    if (event.includes("BUSINESS")) return payload?.title;
    if (event.includes("ACCOUNT")) return payload?.name;
    return "Unknown";
  };

  const parts = event.event?.split("_");
  const eventAction = parts[parts.length - 1].toLowerCase();
  const eventSection = parts.slice(0, -1).join(" ").toLowerCase();
  const name = getName(event.event, event.payload);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 + i / 10, duration: 0.5 }}
      className="w-full rounded-md border-2  border-[#00d4ff80] 
      shadow-[0_0_20px_rgba(0,212,255,0.3)] shadow-md flex flex-col backdrop-blur-sm p-3 text-white/70"
    >
      <div className="flex items-center">
        <p className="text-sm font-medium">06/04/2026 </p>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#00d4ff40] to-transparent ml-4"></div>
      </div>
      <div className="mt-2">
        <p>
          {name} <span className="text-cyan-400">{eventAction}</span>{" "}
          {eventAction === "created" ? "new " : ""}
          <span className="font-bold text-white">{eventSection}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
