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
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // UseEffects ----------------------------

  // Fetch useEffect
  useEffect(() => {
    fetch();
  }, []);

  // Fetch Everything
  const fetch = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await Promise.all([fetchContacts(), fetchAccounts()]);
    } catch (error) {
      setMessage(
        "Could not load information. Please check your connection or try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts`,
        {
          withCredentials: true,
        },
      );

      setContacts(res.data?.payload);
    } catch (error) {
      console.log("Error while getting info: ", error);
      throw error;
    }
  };

  // Fetch Accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
        {
          withCredentials: true,
        },
      );

      setAccounts(res.data?.payload);
    } catch (error) {
      console.log("Error while getting info: ", error);
      throw error;
    }
  };

  // Filter Contacts
  const filteredContacts = contacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name} ${contact.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-grid min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-xl">Contacts</h1>
        <button
          onClick={() => setIsToggled(true)}
          className=" border-2 border-cyan-500 rounded px-4 py-2 hover:shadow-[0_0_10px_rgba(0,212,255,0.5)] cursor-pointer transition-all duration-300"
        >
          + Add Contact
        </button>
      </div>

      {/* Search/Filter */}
      <div className="mb-4 relative w-full md:w-1/2">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setMessage("");
          }}
          placeholder="Search contacts..."
          className="w-full bg-transparent border-2 border-cyan-500 rounded pl-9 pr-3 py-2 text-white 
            focus:outline-none focus:shadow-[0_0_10px_rgba(0,212,255,0.5)] 
            transition-all duration-300"
        />
      </div>

      {message && (
        <p className="text-red-500 text-left m-2 text-sm font-medium">
          {message}
        </p>
      )}
      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-cyan-500">
          <p className="animate-pulse">Loading contacts...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {
            <ContactsTable
              contacts={filteredContacts}
              accounts={accounts}
              onSuccess={fetch}
            />
          }
        </div>
      )}

      <ContactModal
        isToggled={isToggled}
        accounts={accounts}
        onSuccess={fetch}
        onClose={() => setIsToggled(false)}
        contact={null}
      />
    </div>
  );
};

export default Contacts;
