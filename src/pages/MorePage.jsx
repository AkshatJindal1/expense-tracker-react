import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const MorePage = ({ onSignOut }) => {
  const navigate = useNavigate();

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200 min-h-screen">
      <h1 className="text-2xl font-medium mb-4">More Options</h1>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/accounts')}
          className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">
            account_balance_wallet
          </span>
          Manage Accounts
        </button>
        <button
          onClick={() => navigate('/categories')}
          className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">category</span>
          Manage Categories
        </button>
        <button
          onClick={() => navigate('/adjustment')}
          className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">tune</span>
          Adjust Balances
        </button>

        <ThemeToggle />

        <button
          onClick={onSignOut}
          className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center text-red-600 dark:text-red-400"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};
