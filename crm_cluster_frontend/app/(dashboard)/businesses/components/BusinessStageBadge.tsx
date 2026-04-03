import {
  FaInfoCircle,
  FaHandshake,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

type BusinessPageProps = {
  stage: string;
};

const BusinessStageBadge = ({ stage }: BusinessPageProps) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    prospect: {
      color: "text-gray-400 bg-gray-500/20 border border-gray-500/30",
      icon: <FaInfoCircle />,
      label: "Prospect",
    },
    lead: {
      color: "text-blue-400 bg-blue-500/20 border border-blue-500/30",
      icon: <FaInfoCircle />,
      label: "Lead",
    },
    proposal: {
      color: "text-orange-400 bg-orange-500/20 border border-orange-500/30",
      icon: <FaHandshake />,
      label: "Proposal",
    },
    negotiation: {
      color: "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30",
      icon: <FaHandshake />,
      label: "Negotiation",
    },
    won: {
      color: "text-green-400 bg-green-500/20 border border-green-500/30",
      icon: <FaCheckCircle />,
      label: "Won",
    },
    closed: {
      color: "text-cyan-400 bg-cyan-500/20 border border-cyan-500/30",
      icon: <FaCheckCircle />,
      label: "Closed",
    },
    lost: {
      color: "text-red-400 bg-red-500/20 border border-red-500/30",
      icon: <FaTimesCircle />,
      label: "Lost",
    },
    cancelled: {
      color: "text-red-600 bg-red-700/20 border border-red-700/30",
      icon: <FaTimesCircle />,
      label: "Cancelled",
    },
  };

  const current = config[stage] || config.prospect;

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${current.color}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
};

export default BusinessStageBadge;
