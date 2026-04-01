"use client";
import { useState } from "react";
import { Contact } from "../../types";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import axios from "axios";

type TableProps = {
  contacts: Array<Contact>;
  onSuccess: () => void;
};

const ContactsTable = ({ contacts, onSuccess }: TableProps) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts/${contactToDelete}`,
        {
          withCredentials: true,
        },
      );
      onSuccess();
      setContactToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMessage("You are not authorized to delete this contact");
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        setMessage("The account you are trying to delete does not long exists");
      } else {
        setMessage("Server error. Please try again");
      }
      console.log("There was an error deleting contact: ", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#00d4ff1a] backdrop-blur-xs rounded-md border-2 border-[#00d4ff40] overflow-hidden min-h-screen">
      <table className="min-w-full">
        {/* Headers */}
        <thead className="text-[#00d4ff] border-b-2 border-[#00d4ff40]">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Rows */}
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="hover:bg-[#00d4ff10] transition-all duration-200 border-b border-[#00d4ff20]"
            >
              <td className="px-6 py-4 text-sm text-white/80">
                {contact.first_name} {contact.last_name}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {contact.email}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {contact.phone}
              </td>
              <td className="px-6 py-4 text-sm text-white/80">
                {contact.account_id}
              </td>
              <td className="px-6 py-4 text-sm text-white/80 relative">
                <button
                  className="cursor-pointer"
                  onClick={() =>
                    setOpenMenuId(openMenuId === contact.id ? null : contact.id)
                  }
                >
                  <BsThreeDots color="#00d4ff" />
                </button>

                <div
                  className={`absolute right-0 mt-1 bg-[#0d1f3c] border border-[#00d4ff40] rounded-md shadow-lg z-10 transform origin-top transition-all duration-300 ${
                    openMenuId === contact.id
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Butons */}
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-[#00d4ff10] cursor-pointer"
                    onClick={() => {
                      console.log("Edit");
                    }}
                  >
                    <FaEdit color="#00d4ff" /> Edit
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#00d4ff10] cursor-pointer"
                    onClick={() => {
                      setContactToDelete(contact.id);
                      setIsConfirmOpen(true);
                    }}
                  >
                    <FaTrash color="#f87171" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={isConfirmOpen}
        message="Are you sure you want to delete this contact?"
        onConfirm={onConfirm}
        onClose={() => {
          setContactToDelete(null);
          setIsConfirmOpen(false);
        }}
      />

      {message && <p className="text-red-500 text-sm">{message}</p>}
    </div>
  );
};

export default ContactsTable;
