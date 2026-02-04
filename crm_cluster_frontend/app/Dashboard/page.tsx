'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import GraphCard from './GraphCard';

interface DashboardData {
  accounts: {
    total: number;
    history: number[];
  };
  businesses: {
    total: number;
    history: number[];
  };
  contacts: {
    total: number;
    history: number[];
  };
}

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
          'http://localhost:4000/dashboard/summary'
        );

        console.log('Response:', response);

        if (response.status === 200) {
          const { accounts, contacts, business } = response.data.payload;
          setData({
            accounts: accounts,
            businesses: business,
            contacts: contacts,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-grid">
      {/* 1. HEADER */}
      <nav className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">CRM Dashboard</h1>
      </nav>

      <div className="p-8">
        {/* 2. KPIs */}
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

        {/* 3. ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="bg-blue-500 text-white p-4 rounded">
            + New Account
          </button>
          <button className="bg-green-500 text-white p-4 rounded">
            + New Business
          </button>
          <button className="bg-purple-500 text-white p-4 rounded">
            + New Contact
          </button>
        </div>

        {/* 4. TABLAS RECIENTES (próximo paso) */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
