"use client";
import { useState } from "react";
import { Account } from "../../types";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import axios from "axios";
import AccountModal from "./AccountModal";

type TableProps = {
  accounts: Array<Account>;
  onSuccess: () => void;
};

const AccountsTable = ({ accounts, onSuccess }: TableProps) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountToDelete}`,
        {
          withCredentials: true,
        },
      );
      onSuccess();
      setAccountToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMessage("You are not authorized to delete this account");
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        setMessage("The account you are trying to delete does not long exists");
      } else {
        setMessage("Server error. Please try again");
      }
      console.log("There was an error deleting account: ", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

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
              Industry
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Created at
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Rows */}
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-10 text-white/50 italic"
              >
                No accounts found.
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr
                key={account.id}
                className="hover:bg-[#00d4ff10] transition-all duration-200 border-b border-[#00d4ff20]"
              >
                <td className="px-6 py-4 text-sm text-white/80">
                  {account.name}
                </td>
                <td className="px-6 py-4 text-sm text-white/80">
                  {account.industry}
                </td>
                <td className="px-6 py-4 text-sm text-white/80">
                  {formatDate(account.created_at)}
                </td>
                <td className="px-6 py-4 text-sm text-white/80 relative">
                  <button
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === account.id ? null : account.id,
                      )
                    }
                  >
                    <BsThreeDots color="#00d4ff" />
                  </button>

                  <div
                    className={`absolute right-0 mt-1 bg-[#0d1f3c] border border-[#00d4ff40] rounded-md shadow-lg z-10 transform origin-top transition-all duration-300 ${
                      openMenuId === account.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0 pointer-events-none"
                    }`}
                  >
                    {/* Butons */}
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-[#00d4ff10] cursor-pointer"
                      onClick={() => {
                        setAccountToEdit(account);
                        setIsEditOpen(true);
                      }}
                    >
                      <FaEdit color="#00d4ff" /> Edit
                    </button>
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#00d4ff10] cursor-pointer"
                      onClick={() => {
                        setAccountToDelete(account.id);
                        setIsConfirmOpen(true);
                      }}
                    >
                      <FaTrash color="#f87171" /> Delete
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
        message="Are you sure you want to delete this account?"
        onConfirm={onConfirm}
        onClose={() => {
          setAccountToDelete(null);
          setIsConfirmOpen(false);
        }}
      />

      <AccountModal
        isToggled={isEditOpen}
        onSuccess={onSuccess}
        onClose={() => setIsEditOpen(false)}
        account={accountToEdit}
      />

      {message && <p className="text-red-500 text-sm">{message}</p>}
    </div>
  );
};

export default AccountsTable;
