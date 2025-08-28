import React, { useState, useMemo } from 'react';

export const TransactionCard = ({ tx }) => {
  const amountColor =
    tx.type === 'Income'
      ? 'text-green-600'
      : tx.type === 'Transfer'
      ? 'text-gray-500'
      : 'text-red-600';
  const sign = tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '' : '-';

  let detailHTML = '';
  if (tx.type === 'Transfer') {
    detailHTML = `${tx.source} → ${tx.destination}`;
  } else if (tx.type === 'Expense') {
    detailHTML = tx.source;
  } else {
    detailHTML = tx.destination;
  }

  return (
    <div className="transaction-card bg-white p-3 rounded-lg shadow-sm flex items-center">
      <div className="flex-grow">
        <p className="font-normal">{tx.category || 'Transaction'}</p>
        <p className="text-xs text-gray-500">{detailHTML}</p>
        <p className="text-sm text-gray-400">
          {tx.date?.toDate().toLocaleDateString()}
        </p>
      </div>
      <p className={`font-normal ${amountColor} ml-2`}>
        {sign} {tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
      </p>
    </div>
  );
};