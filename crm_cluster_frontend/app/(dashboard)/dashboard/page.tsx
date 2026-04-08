"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import GraphCard from "./components/GraphCard";
import RecentCard from "./components/RecentCard";

const DashboardPage = () => {
  const [data, setData] = useState({
    accounts: { total: 0, history: [] },
    businesses: { total: 0, history: [] },
    contacts: { total: 0, history: [] },
  });

  useEffect(() => {
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
        console.error("Error:", error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-grid flex flex-col">
      <div className="p-8">
        <div className="grid grid-cols-3 gap-4 mb-8 perspective-[2000px]">
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
      </div>

      <div className="flex justify-center w-full flex-1 p-8 gap-4">
        <RecentCard />
      </div>
    </div>
  );
};

export default DashboardPage;
