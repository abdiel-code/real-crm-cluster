import { motion } from "motion/react";

type AcctivityProps = {
  event: any;
  i: number;
};

const ActivityItem = ({ event, i }: AcctivityProps) => {
  const getActivityLabel = (event: any, payload: any) => {
    const parts = event.event?.split("_");
    const section =
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const action =
      parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    let target = payload?.name || payload?.title || payload?.first_name;

    return { section, action, target };
  };

  const label = getActivityLabel(event, event.payload);
  const section = label?.section;
  const action = label?.action;
  const target = label?.target;
  const date = formatDate(event.timestamp);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 + i / 10, duration: 0.5 }}
      className="w-full rounded-md border-2  border-[#00d4ff80] 
      shadow-[0_0_20px_rgba(0,212,255,0.3)] shadow-md flex flex-col backdrop-blur-sm p-3 text-white/70"
    >
      <div className="flex items-center">
        <p className="text-sm font-medium">{date}</p>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#00d4ff40] to-transparent ml-4"></div>
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
