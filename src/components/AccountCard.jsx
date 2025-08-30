import React, { useState, useMemo, useEffect } from 'react';

const AccountCard = ({ account, isSelecting, isSelected, onClick }) => {
  // FIX: Use a mapping for icons to support all types
  const accountTypeIcons = {
    Bank: "account_balance",
    "Credit Card": "credit_card",
    Wallet: "account_balance_wallet",
    Splitwise: "receipt_long",
  };
  const icon = accountTypeIcons[account.type] || 'credit_score'; // Fallback icon

  return (
    <div onClick={() => onClick(account)} className={`bg-white p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-100 border-blue-500 border' : ''}`}>
      {isSelecting && (
        <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600">
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      )}
      <div className="flex items-center flex-grow">
        <span className="material-symbols-outlined mr-3 text-gray-500">{icon}</span>
        <div>
          <p className="font-normal">{account.name}</p>
          <p className="text-xs text-gray-500">{account.type}</p>
        </div>
      </div>
    </div>
  );
};
export default AccountCard;