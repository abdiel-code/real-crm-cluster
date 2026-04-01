"use client";

import { useEffect, useState } from "react";
import ContactsTable from "./components/ContactsTable";
import ContactModal from "./components/ContactModal";
import axios from "axios";
import { Contact, Account } from "../types";

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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

  return (
    <div className="p-8 bg-grid min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1>Contacts</h1>
        <button onClick={() => setIsToggled(true)}>+ Add Contact</button>
      </div>

      {/* Search/Filter */}
      <div className="mb-4">
        <input placeholder="Search contacts..." />
      </div>

      {/* Table */}
      <div>{<ContactsTable contacts={contacts} />}</div>

      {/*Modal*/}
      {isToggled && (
        <ContactModal
          accounts={accounts}
          onSuccess={fetchContacts}
          onClose={() => setIsToggled(false)}
        />
      )}
    </div>
  );
};

export default Contacts;
