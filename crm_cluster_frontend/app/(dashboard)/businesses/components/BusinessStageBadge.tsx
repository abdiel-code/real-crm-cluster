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
      color: "text-gray-500 bg-gray-100",
      icon: <FaInfoCircle />,
      label: "Prospect",
    },
    lead: {
      color: "text-blue-500 bg-blue-50",
      icon: <FaInfoCircle />,
      label: "Lead",
    },
    proposal: {
      color: "text-orange-500 bg-orange-50",
      icon: <FaHandshake />,
      label: "Proposal",
    },
    negotiation: {
      color: "text-orange-600 bg-orange-100",
      icon: <FaHandshake />,
      label: "Negotiation",
    },
    won: {
      color: "text-green-600 bg-green-100",
      icon: <FaCheckCircle />,
      label: "Won",
    },
    closed: {
      color: "text-green-700 bg-green-200",
      icon: <FaCheckCircle />,
      label: "Closed",
    },
    lost: {
      color: "text-red-600 bg-red-100",
      icon: <FaTimesCircle />,
      label: "Lost",
    },
    cancelled: {
      color: "text-red-700 bg-red-200",
      icon: <FaTimesCircle />,
      label: "Cancelled",
    },
  };

  const current = config[stage] || config.prospect;

  return (
    <span
      className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${current.color}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
};

export default BusinessStageBadge;
