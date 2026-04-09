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
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // UseEffects ----------------------------

  // Fetch UseEffect
  useEffect(() => {
    fetch();
  }, []);

  // Fetch function
  const fetch = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await Promise.all([fetchBusinesses(), fetchContacts()]);
    } catch (error) {
      setMessage(
        "Could not load information. Please check your connection or try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      throw error;
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

  // Filter Businesses
  const filteredBusinesses = businesses.filter((business) =>
    `${business.title} ${business.amount} ${business.stage}`
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
          className=" border-2 border-cyan-500 rounded px-4 py-2 hover:shadow-[0_0_10px_rgba(0,212,255,0.5)] cursor-pointer transition-all duration-300"
        >
          + Add Business
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
          placeholder="Search businesses..."
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
          <p className="animate-pulse">Loading businesses...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {
            <BusinessesTable
              businesses={filteredBusinesses}
              onSuccess={fetch}
              contacts={contacts}
            />
          }
        </div>
      )}

      <BusinessModal
        isToggled={isToggled}
        onSuccess={fetch}
        onClose={() => setIsToggled(false)}
        business={null}
        contacts={contacts}
      />
    </div>
  );
};

export default Businesses;
