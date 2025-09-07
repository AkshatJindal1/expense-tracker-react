import React from 'react';

export const TransactionCard = ({
  transaction,
  isSelecting,
  isSelected,
  onClick,
}) => {
  const tx = transaction;
  const amountColor =
    tx.type === 'Income'
      ? 'text-green-600 dark:text-green-400'
      : tx.type === 'Transfer'
        ? 'text-gray-500 dark:text-gray-400'
        : 'text-red-600 dark:text-red-400';
  const sign = tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '' : '-';

  let detailHTML = '';
  if (tx.type === 'Transfer') detailHTML = `${tx.source} → ${tx.destination}`;
  else if (tx.type === 'Expense') detailHTML = tx.source;
  else detailHTML = tx.destination;
  const bgColor = isSelected
    ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 border'
    : 'bg-white dark:bg-slate-800';

  return (
    <div
      onClick={() => onClick(tx)}
      className={`transaction-card p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${bgColor}`}
    >
      {isSelecting && (
        <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600 dark:text-blue-400">
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      )}
      <div className="flex-grow text-gray-800 dark:text-gray-200">
        <p className="font-normal">{tx.category || 'Transaction'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{detailHTML}</p>
        {tx.date && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {tx.date.toDate().toLocaleDateString()}
          </p>
        )}
      </div>
      <p className={`font-normal ${amountColor} ml-2`}>
        {sign}{' '}
        {tx.amount.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        })}
      </p>
    </div>
  );
};
