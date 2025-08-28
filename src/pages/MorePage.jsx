import React, { useState, useMemo, useEffect } from 'react';

const MorePage = ({ onNavigate, onSignOut }) => {
  return (
    <div className="page p-4 active">
      <h1 className="text-2xl font-medium text-gray-800 mb-4">More Options</h1>
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('accounts')} // Will be created later
          className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">account_balance_wallet</span>
          Manage Accounts
        </button>
        <button
          onClick={() => onNavigate('categories')} // Will be created later
          className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">category</span>
          Manage Categories
        </button>
        <button
          onClick={() => onNavigate('adjustment')}
          className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center"
        >
          <span className="material-symbols-outlined mr-3">tune</span>
          Adjust Balances
        </button>
        <button
          onClick={onSignOut}
          className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex items-center text-red-600"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default MorePage;