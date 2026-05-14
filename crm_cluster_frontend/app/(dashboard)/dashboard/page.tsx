"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import GraphCard from "./components/GraphCard";
import RecentCard from "./components/RecentCard";

const DashboardPage = () => {
  const [data, setData] = useState({
    accounts: { total: null, history: [] },
    businesses: { total: null, history: [] },
    contacts: { total: null, history: [] },
  });
  const [message, setMessage] = useState("");

  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`,
        { withCredentials: true },
      );

      if (response.status === 200) {
        const { accounts, contacts, businesses } = response.data.payload;
        setData({
          accounts: accounts,
          businesses: businesses,
          contacts: contacts,
        });
      }
    } catch (error) {
      setMessage("Failed to load dashboard summary. Please try again later.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-grid p-4 md:p-8 flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 perspective-[2000px]">
        <GraphCard
          history={data.accounts.history}
          total={data.accounts.total}
          index={1}
          title="Accounts"
        />
        <GraphCard
          history={data.businesses.history}
          total={data.businesses.total}
          index={2}
          title="Businesses"
        />
        <GraphCard
          history={data.contacts.history}
          total={data.contacts.total}
          index={3}
          title="Contacts"
        />
      </div>

      {message && (
        <div className="p-4 mb-2 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm text-center">
          {message}
        </div>
      )}

      <div className="flex justify-center w-full flex-1">
        <RecentCard />
      </div>
    </div>
  );
};

export default DashboardPage;
