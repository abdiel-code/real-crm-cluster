import { Contact, Account } from "../../types";
import { useEffect, useState } from "react";
import axios from "axios";

type ContactModalProps = {
  isToggled: boolean;
  accounts: Array<Account>;
  onSuccess: () => void;
  onClose: () => void;
  contact: Contact | null;
};

const ContactModal = ({
  isToggled,
  accounts,
  onSuccess,
  onClose,
  contact,
}: ContactModalProps) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    account_id: null as number | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // UseEffects ---------------------------------
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || "",
        account_id: contact.account_id,
      });
    }
  }, [contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "account_id" ? (value === "0" ? null : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Validations
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone
    ) {
      setIsLoading(false);
      return;
    }

    // Send request
    try {
      if (contact) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/contacts/${contact.id}`,
          formData,
          {
            withCredentials: true,
          },
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/contacts`,
          formData,
          {
            withCredentials: true,
          },
        );
      }

      onSuccess();
      onClose();
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        account_id: null,
      });
      setMessage("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setMessage("A contact with this email already exists.");
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
          {contact ? "Edit contact" : "Create Contact"}
        </h1>
        <div>
          <label
            htmlFor="firstNane"
            id="firstName"
            className="text-white/60 text-sm font-semibold"
          >
            First Name
          </label>
          <input
            value={formData.first_name}
            type="text"
            id="firstName"
            name="first_name"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            id="lastName"
            className="text-white/60 text-sm font-semibold"
          >
            Last Name
          </label>
          <input
            value={formData.last_name}
            type="text"
            id="lastName"
            name="last_name"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            id="email"
            className="text-white/60 text-sm font-semibold"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            id="phone"
            className="text-white/60 text-sm font-semibold"
          >
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            onChange={handleChange}
            value={formData.phone}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="accountId"
            id="accountId"
            className="text-white/60 text-sm font-semibold"
          >
            Account ID
          </label>
          <select
            name="account_id"
            id="accountId"
            value={formData.account_id ?? 0}
            onChange={handleChange}
            className="w-full bg-[#0d1f3c] border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] transition-all duration-300 cursor-pointer"
          >
            <option value={0}>No Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
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
            {isLoading ? "Loading..." : contact ? "Edit" : "Create"}
          </button>
        </div>

        {message && <p className="text-red-500 text-sm">{message}</p>}
      </form>
    </div>
  );
};

export default ContactModal;
