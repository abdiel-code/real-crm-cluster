import { Business, Contact } from "../../types";
import { useEffect, useState } from "react";
import axios from "axios";

type BusinessModalProps = {
  isToggled: boolean;
  onSuccess: () => void;
  onClose: () => void;
  business: Business | null;
  contacts: Array<Contact>;
};

const BusinessModal = ({
  isToggled,
  onSuccess,
  onClose,
  business,
  contacts,
}: BusinessModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    stage: "prospect",
    contact_id: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const stages = [
    "prospect",
    "lead",
    "proposal",
    "negotiation",
    "won",
    "lost",
    "closed",
    "cancelled",
  ];

  // UseEffects ---------------------------------

  // Check if it comes from a business
  useEffect(() => {
    if (business) {
      setFormData({
        title: business.title,
        amount: business.amount.toString(),
        stage: business.stage,
        contact_id: business.contact_id || 0,
      });
    }
  }, [business]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "contact_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Validations
    if (!formData.title) {
      setMessage("Title is required");
      setIsLoading(false);
      return;
    } else if (!formData.amount) {
      setMessage("Amount is required");
      setIsLoading(false);
      return;
    } else if (!formData.stage) {
      setMessage("Stage is required");
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      title: formData.title,
      amount: formData.amount.toString(),
      stage: formData.stage.toLowerCase(),
      contact_id: formData.contact_id === 0 ? null : formData.contact_id, // 0 -> null
    };

    // Send request
    try {
      if (business) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/businesses/${business.id}`,
          dataToSend,
          {
            withCredentials: true,
          },
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/businesses`,
          dataToSend,
          {
            withCredentials: true,
          },
        );
      }

      onSuccess();
      onClose();
      setFormData({
        title: "",
        amount: "",
        stage: "Discovery",
        contact_id: 0,
      });
      setMessage("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setMessage("A business with this information already exists.");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setMessage("Server error. Please try again");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isToggled ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`bg-[#0d1f3c] border-2 border-[#00d4ff40] rounded-md p-6 flex flex-col gap-4 w-full max-w-sm transform transition-all duration-300 ${
          isToggled
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <h1 className="text-white text-xl font-bold mb-2">
          {business ? "Edit Business" : "Create Business"}
        </h1>
        <div>
          <label
            htmlFor="title"
            id="title"
            className="text-white/60 text-sm font-semibold"
          >
            Title
          </label>
          <input
            value={formData.title}
            type="text"
            id="title"
            name="title"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            id="amount"
            className="text-white/60 text-sm font-semibold"
          >
            Amount
          </label>
          <input
            value={formData.amount}
            type="text"
            id="amount"
            name="amount"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="stage"
            id="stage"
            className="text-white/60 text-sm font-semibold"
          >
            Stage
          </label>

          <select
            name="stage"
            id="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full bg-[#0d1f3c] border-2 border-[#00d4ff40] rounded px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff80]"
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="stage"
            id="stage"
            className="text-white/60 text-sm font-semibold"
          >
            Contacts
          </label>
          <select
            name="contact_id"
            id="contact_id"
            value={formData.contact_id ?? 0}
            onChange={handleChange}
            className="w-full bg-[#0d1f3c] border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
          focus:outline-none focus:border-[#00d4ff80] transition-all duration-300 cursor-pointer"
          >
            <option value={0}>No Contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-2 border-white/20 rounded p-2 text-white/60 
    hover:bg-[#00d4ff10] cursor-pointer transition-all duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 border-2 border-cyan-500 rounded p-2 text-white cursor-pointer 
    hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] 
    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? "Loading..." : business ? "Edit" : "Create"}
          </button>
        </div>

        {message && <p className="text-red-500 text-sm">{message}</p>}
      </form>
    </div>
  );
};

export default BusinessModal;
