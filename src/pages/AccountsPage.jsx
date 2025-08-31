import React, { useState, useMemo } from 'react';
import { AccountCard } from '../components/AccountCard';

export const AccountsPage = ({ accounts, onBack, onAddNew, onEdit, onDelete }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const groupedAccounts = useMemo(() => {
    return accounts.reduce((acc, account) => {
      const { type } = account;
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
  }, [accounts]);

  const handleCardClick = (account) => {
    if (isSelecting) {
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(account.id)) {
        newSelectedIds.delete(account.id);
      } else {
        newSelectedIds.add(account.id);
      }
      setSelectedIds(newSelectedIds);
    } else {
      onEdit(account);
    }
  };

  const toggleSelectionMode = () => {
    if (isSelecting) {
      setSelectedIds(new Set());
    }
    setIsSelecting(!isSelecting);
  };

  const handleDeleteSelected = () => {
    onDelete(Array.from(selectedIds));
    toggleSelectionMode();
  };

  return (
    <div className="page active bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm pt-4 px-4 pb-4">
        <div className="flex items-center justify-between mb-4 text-gray-800 dark:text-gray-200">
          {isSelecting ? (
            <>
              <button onClick={toggleSelectionMode} className="material-symbols-outlined">close</button>
              <span className="font-medium">{selectedIds.size} selected</span>
              <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0} className="material-symbols-outlined text-red-600 dark:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-600">delete</button>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <button onClick={onBack} className="material-symbols-outlined mr-2">arrow_back</button>
                <h1 className="text-2xl font-medium">Accounts</h1>
              </div>
              <button onClick={toggleSelectionMode} className="p-2 material-symbols-outlined">select</button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 px-4 pb-24">
        {Object.entries(groupedAccounts).sort(([typeA], [typeB]) => typeA.localeCompare(typeB)).map(([type, accountsInGroup]) => (
          <div key={type}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-2">{type}</h3>
            <div className="space-y-3">
              {accountsInGroup.map(acc => (
                <AccountCard key={acc.id} account={acc} isSelecting={isSelecting} isSelected={selectedIds.has(acc.id)} onClick={handleCardClick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isSelecting && (
        <button onClick={onAddNew} className="fab page-fab bg-blue-600 dark:bg-blue-500 text-white">
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
  );
};