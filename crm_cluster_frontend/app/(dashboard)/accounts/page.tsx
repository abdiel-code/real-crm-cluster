"use client";

import { useEffect, useState } from "react";
import AccountsTable from "./components/AccountsTable";
import AccountModal from "./components/AccountModal";
import axios from "axios";
import { Account } from "../types";
import { FaSearch } from "react-icons/fa";

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // UseEffects ----------------------------

  // Fetch Accounts UseEffect
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch Accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
        {
          withCredentials: true,
        },
      );

      console.log("Response: ", res.data);

      // Add data to the mock info
      setAccounts(res.data?.payload);
    } catch (error) {
      console.log("Error while getting info: ", error);
    }
  };

  // Filter Accounts
  const filteredAccounts = accounts.filter((account) =>
    `${account.name} ${account.industry} ${account.created_at}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-grid min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl">Accounts</h1>
        <button
          onClick={() => setIsToggled(true)}
          className="border-2 border-[#00d4ff40] rounded px-2 py-2 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] cursor-pointer"
        >
          + Add Account
        </button>
      </div>

      {/* Search/Filter */}
      <div className="mb-4 relative w-1/2">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search accounts..."
          className="w-full bg-transparent border-2 border-[#00d4ff40] rounded pl-9 pr-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
        />
      </div>

      {/* Table */}
      <div>
        {
          <AccountsTable
            accounts={filteredAccounts}
            onSuccess={fetchAccounts}
          />
        }
      </div>

      <AccountModal
        isToggled={isToggled}
        onSuccess={fetchAccounts}
        onClose={() => setIsToggled(false)}
        account={null}
      />
    </div>
  );
};

export default Accounts;
