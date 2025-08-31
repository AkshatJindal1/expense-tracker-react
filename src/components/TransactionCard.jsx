import React from 'react';

export const TransactionCard = ({ transaction, isSelecting, isSelected, onClick }) => {
    const tx = transaction;
    const amountColor = tx.type === 'Income' ? 'text-green-600' : tx.type === 'Transfer' ? 'text-gray-500' : 'text-red-600';
    const sign = tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '' : '-';
    
    let detailHTML = '';
    if (tx.type === 'Transfer') detailHTML = `${tx.source} → ${tx.destination}`;
    else if (tx.type === 'Expense') detailHTML = tx.source;
    else detailHTML = tx.destination;

    return (
        <div onClick={() => onClick(tx)} className={`transaction-card bg-white p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-100 border-blue-500 border' : ''}`}>
            {isSelecting && (
                <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600">
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                </span>
            )}
            <div className="flex-grow">
                <p className="font-normal">{tx.category || "Transaction"}</p>
                <p className="text-xs text-gray-500">{detailHTML}</p>
                {tx.date && <p className="text-sm text-gray-400">{tx.date.toDate().toLocaleDateString()}</p>}
            </div>
            <p className={`font-normal ${amountColor} ml-2`}>{sign} {tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
        </div>
    );
};