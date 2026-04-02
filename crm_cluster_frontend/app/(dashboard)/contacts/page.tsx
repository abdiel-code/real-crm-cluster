"use client";

import { useEffect, useState } from "react";
import ContactsTable from "./components/ContactsTable";
import ContactModal from "./components/ContactModal";
import axios from "axios";
import { Contact, Account } from "../types";
import { FaSearch } from "react-icons/fa";

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // UseEffects ----------------------------

  // Fetch Contacts UseEffect
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch Contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts`,
        {
          withCredentials: true,
        },
      );

      console.log("Response: ", res.data);

      // Add data to the mock info
      setContacts(res.data?.payload);
    } catch (error) {
      console.log("Error while getting info: ", error);
    }
  };

  // Fetch Accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
          {
            withCredentials: true,
          },
        );

        console.log("Response: ", res.data);

        setAccounts(res.data?.payload);
      } catch (error) {
        console.log("Error while getting info: ", error);
      }
    };
    fetchAccounts();
  }, []);

  // Filter Contacts
  const filteredContacts = contacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name} ${contact.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-grid min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl">Contacts</h1>
        <button
          onClick={() => setIsToggled(true)}
          className="border-2 border-[#00d4ff40] rounded px-2 py-2 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] cursor-pointer"
        >
          + Add Contact
        </button>
      </div>

      {/* Search/Filter */}
      <div className="mb-4 relative w-1/2">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-transparent border-2 border-[#00d4ff40] rounded pl-9 pr-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
        />
      </div>

      {/* Table */}
      <div>
        {
          <ContactsTable
            contacts={filteredContacts}
            accounts={accounts}
            onSuccess={fetchContacts}
          />
        }
      </div>

      <ContactModal
        isToggled={isToggled}
        accounts={accounts}
        onSuccess={fetchContacts}
        onClose={() => setIsToggled(false)}
        contact={null}
      />
    </div>
  );
};

export default Contacts;
