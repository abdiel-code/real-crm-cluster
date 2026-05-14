import Link from "next/link";
import { usePathname } from "next/navigation";

type SideBarItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  isCollapsed: boolean;
};

const SideBarItem = ({ icon, label, to, isCollapsed }: SideBarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className={`flex items-center gap-3 w-full px-4 rounded-md transition cursor-pointer ${
        isActive
          ? "bg-[#00d4ff20] text-cyan-400 border-l-2 border-cyan-400"
          : "text-white/60 hover:bg-[#00d4ff10] hover:text-white"
      } ${isCollapsed ? "justify-center hidden md:block" : ""}`}
    >
      <div className="text-xl">{icon}</div>
      <h2>{!isCollapsed && label}</h2>
    </Link>
  );
};

export default SideBarItem;
