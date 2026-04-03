"use client";

import BusinessStageBadge from "./components/BusinessStageBadge";
import { useEffect, useState } from "react";
import BusinessesTable from "./components/BusinessesTable";
import BusinessModal from "./components/BusinessModal";
import axios from "axios";
import { Contact } from "../types";
import { Business } from "../types";
import { FaSearch } from "react-icons/fa";

const Businesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // UseEffects ----------------------------

  // Fetch Businesses UseEffect
  useEffect(() => {
    fetchBusinesses();
    fetchContacts();
  }, []);

  // Fetch Businesses
  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/businesses`,
        {
          withCredentials: true,
        },
      );

      console.log("Response: ", res.data);

      // Add data to the mock info
      setBusinesses(res.data?.payload);
    } catch (error) {
      console.log("Error while getting info: ", error);
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
    }
  };

  // Filter Businesses
  const filteredBusinesses = businesses.filter((businesses) =>
    `${businesses.title} ${businesses.amount} ${businesses.stage}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-grid min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl">Businesses</h1>
        <button
          onClick={() => setIsToggled(true)}
          className="border-2 border-[#00d4ff40] rounded px-2 py-2 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] cursor-pointer"
        >
          + Add Business
        </button>
      </div>

      {/* Search/Filter */}
      <div className="mb-4 relative w-1/2">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search businesses..."
          className="w-full bg-transparent border-2 border-[#00d4ff40] rounded pl-9 pr-3 py-2 text-white 
            focus:outline-none focus:border-[#00d4ff80] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] 
            transition-all duration-300"
        />
      </div>

      {/* Table */}
      <div>
        {
          <BusinessesTable
            businesses={filteredBusinesses}
            onSuccess={fetchBusinesses}
            contacts={contacts}
          />
        }
      </div>

      <BusinessModal
        isToggled={isToggled}
        onSuccess={fetchBusinesses}
        onClose={() => setIsToggled(false)}
        business={null}
        contacts={contacts}
      />
    </div>
  );
};

export default Businesses;
