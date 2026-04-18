import SideBarItem from "./SideBarItem";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaTasks,
  FaUsers,
  FaPaw,
  FaUsersCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaCog,
  FaChartBar,
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <FaChartBar color="#00d4ff" />,
  contacts: <FaUser color="#00d4ff" />,
  accounts: <FaBuilding color="#00d4ff" />,
  businesses: <FaBriefcase color="#00d4ff" />,
};

const items = [
  { alt: "dashboard", label: "Dashboard", to: "/dashboard" },
  { alt: "contacts", label: "Contacts", to: "/contacts" },
  { alt: "accounts", label: "Accounts", to: "/accounts" },
  { alt: "businesses", label: "Businesses", to: "/businesses" },
];

type SideBarProps = {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
};

const SideBar = ({ isCollapsed, toggleCollapsed }: SideBarProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      router.push("/");
    } catch (error) {
      console.log("Server error: ", error);
      return;
    }
  };

  return (
    <div
      className={`relative top-0 left-0 h-full bg-[#0d1f3c] z-50
      transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-16" : "w-50"}
      border-r-2 border-[#495867]
      flex flex-col gap-4 pt-4 `}
    >
      <div className="flex items-center gap-3 w-full px-4 pb-4">
        <FaPaw color="#00d4ff" className="w-10 h-10" />
        {!isCollapsed && (
          <h1 className="text-xl text-white/60 font-bold">FOXCOON</h1>
        )}
      </div>

      {items.map((item) => (
        <SideBarItem
          key={item.alt}
          icon={iconMap[item.alt]}
          label={item.label}
          to={`/${item.alt}`}
          isCollapsed={isCollapsed}
        />
      ))}

      <div className="h-[1px] w-[80%] bg-[#495867] my-4"></div>

      <button
        className={`flex items-center gap-3 w-full px-4 transition cursor-pointer text-white/60 hover:bg-[#00d4ff10] 
       ${isCollapsed ? "justify-center" : ""}`}
        onClick={handleLogout}
      >
        <FaSignOutAlt color="#00d4ff" />
        <p>{isCollapsed ? "" : "Logout"}</p>
      </button>

      <div className="mt-auto flex items-center justify-between px-4 pb-4">
        <button onClick={toggleCollapsed} className="cursor-pointer ml-auto">
          {isCollapsed ? (
            <FaChevronRight color="white" />
          ) : (
            <FaChevronLeft color="white" />
          )}
        </button>
      </div>
    </div>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
