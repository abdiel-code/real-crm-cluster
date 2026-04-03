import { Account } from "../../types";
import { useEffect, useState } from "react";
import axios from "axios";

type AccountModalProps = {
  isToggled: boolean;
  onSuccess: () => void;
  onClose: () => void;
  account: Account | null;
};

const AccountModal = ({
  isToggled,
  onSuccess,
  onClose,
  account,
}: AccountModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // UseEffects ---------------------------------
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        industry: account.industry ?? "",
      });
    }
  }, [account]);

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
    if (!formData.name) {
      setMessage("Name is required");
      setIsLoading(false);
      return;
    }

    // Send request
    try {
      if (account) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/${account.id}`,
          formData,
          {
            withCredentials: true,
          },
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
          formData,
          {
            withCredentials: true,
          },
        );
      }

      onSuccess();
      onClose();
      setFormData({
        name: "",
        industry: "",
      });
      setMessage("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setMessage("An account with this information already exists.");
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
          {account ? "Edit Account" : "Create Account"}
        </h1>
        <div>
          <label
            htmlFor="name"
            id="name"
            className="text-white/60 text-sm font-semibold"
          >
            Name
          </label>
          <input
            value={formData.name}
            type="text"
            id="name"
            name="name"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
        </div>

        <div>
          <label
            htmlFor="industry"
            id="industry"
            className="text-white/60 text-sm font-semibold"
          >
            Industry
          </label>
          <input
            value={formData.industry}
            type="text"
            id="industry"
            name="industry"
            onChange={handleChange}
            className="w-full bg-transparent border-2 border-[#00d4ff40] rounded px-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
          />
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
            {isLoading ? "Loading..." : account ? "Edit" : "Create"}
          </button>
        </div>

        {message && <p className="text-red-500 text-sm">{message}</p>}
      </form>
    </div>
  );
};

export default AccountModal;
