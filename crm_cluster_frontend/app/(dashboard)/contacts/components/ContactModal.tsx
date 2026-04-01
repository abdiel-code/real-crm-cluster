import { Contact, Account } from "../../types";
import { useState } from "react";
import axios from "axios";

type ContactModalProps = {
  accounts: Array<Account>;
  onSuccess: () => void;
  onClose: () => void;
};

const ContactModal = ({ accounts, onSuccess, onClose }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    account_id: null as number | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    // Post
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts`,
        formData,
        {
          withCredentials: true,
        },
      );
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
    <form onSubmit={handleSubmit}>
      <h1>Create Contact</h1>
      <div>
        <label htmlFor="firstNane" id="firstName">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="first_name"
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="lastName" id="lastName">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="last_name"
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="email" id="email">
          Email
        </label>
        <input type="text" id="email" name="email" onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="phone" id="phone">
          Phone
        </label>
        <input type="text" id="phone" name="phone" onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="accountId" id="accountId">
          Account ID
        </label>
        <select name="account_id" id="accountId" onChange={handleChange}>
          <option value={0}>No Account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="border-2 border-cyan-500 rounded p-2 cursor-pointer 
  hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] 
  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : "Create"}
      </button>

      {message && <p className="text-red-500 text-sm">{message}</p>}
    </form>
  );
};

export default ContactModal;
