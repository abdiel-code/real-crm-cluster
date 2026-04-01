"use client";
import { useState } from "react";
import { Contact } from "../../types";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";

type TableProps = {
  contacts: Array<Contact>;
};

const ContactsTable = ({ contacts }: TableProps) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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
                  <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-[#00d4ff10] cursor-pointer">
                    <FaEdit color="#00d4ff" /> Edit
                  </button>
                  <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#00d4ff10] cursor-pointer">
                    <FaTrash color="#f87171" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;
