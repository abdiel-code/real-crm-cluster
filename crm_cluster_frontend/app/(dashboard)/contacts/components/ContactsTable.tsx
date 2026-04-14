"use client";
import { useState } from "react";
import { Account, Contact } from "../../types";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import ContactModal from "./ContactModal";
import axios from "axios";

type TableProps = {
  contacts: Array<Contact>;
  accounts: Array<Account>;
  onSuccess: () => void;
};

const ContactsTable = ({ contacts, accounts, onSuccess }: TableProps) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onConfirm = async () => {
    if (isLoading) return;
    setMessage("");
    setIsLoading(true);
    try {
      await axios.delete(
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
        setMessage("The contact you are trying to delete no longer exists");
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
    <div className="bg-cyan-500/10 backdrop-blur-xs rounded-md border-2 border-cyan-500/40 overflow-x-auto min-h-screen">
      {message && (
        <div className="p-4 mb-2 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm">
          {message}
        </div>
      )}
      <table className="min-w-full">
        {/* Headers */}
        <thead className="text-cyan-400 border-b-2 border-cyan-500/40">
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
          {contacts.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-10 text-white/50 italic"
              >
                No contacts found.
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-cyan-500/10 transition-all duration-200 border-b border-cyan-500/20"
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
                  {accounts.find((a) => a.id === contact.account_id)?.name ||
                    "No Company"}
                </td>
                <td className="px-6 py-4 text-sm text-white/80 relative">
                  <button
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === contact.id ? null : contact.id,
                      )
                    }
                  >
                    <BsThreeDots className="text-cyan-400" />
                  </button>

                  <div
                    className={`absolute right-0 mt-1 bg-[#0d1f3c] border border-cyan-500/40 rounded-md shadow-lg z-10 transform origin-top transition-all duration-300 ${
                      openMenuId === contact.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0 pointer-events-none"
                    }`}
                  >
                    {/* Butons */}
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-cyan-500/10 cursor-pointer"
                      onClick={() => {
                        setContactToEdit(contact);
                        setIsEditOpen(true);
                        setOpenMenuId(null);
                      }}
                    >
                      <FaEdit className="text-cyan-400" /> Edit
                    </button>
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-cyan-500/10 cursor-pointer"
                      onClick={() => {
                        setContactToDelete(contact.id);
                        setIsConfirmOpen(true);
                        setOpenMenuId(null);
                      }}
                    >
                      <FaTrash className="text-red-400" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
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

      <ContactModal
        isToggled={isEditOpen}
        accounts={accounts}
        onSuccess={onSuccess}
        onClose={() => setIsEditOpen(false)}
        contact={contactToEdit}
      />
    </div>
  );
};

export default ContactsTable;
