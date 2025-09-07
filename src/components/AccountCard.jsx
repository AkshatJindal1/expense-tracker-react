import React from 'react';

export const AccountCard = ({ account, isSelecting, isSelected, onClick }) => {
  const accountTypeIcons = {
    Bank: 'account_balance',
    'Credit Card': 'credit_card',
    Wallet: 'account_balance_wallet',
    Splitwise: 'receipt_long',
  };
  const icon = accountTypeIcons[account.type] || 'credit_score'; // Fallback icon
  const bgColor = isSelected
    ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 border'
    : 'bg-white dark:bg-slate-800';

  return (
    <div
      onClick={() => onClick(account)}
      className={`account-card p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${bgColor}`}
    >
      {isSelecting && (
        <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600 dark:text-blue-400">
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      )}
      <div className="flex items-center flex-grow text-gray-800 dark:text-gray-200">
        <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">
          {icon}
        </span>
        <div>
          <p className="font-normal">{account.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {account.type}
          </p>
        </div>
      </div>
    </div>
  );
};
