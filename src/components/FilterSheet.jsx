import React, { useState, useEffect } from 'react';

export const FilterSheet = ({ isOpen, onClose, filters, setFilters, accounts }) => {
  // State to manage whether all account filter chips are shown
  const [accountChipsExpanded, setAccountChipsExpanded] = useState(false);

  // Reset expansion when the sheet is closed and re-opened
  useEffect(() => {
    if (!isOpen) {
      setAccountChipsExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTypeToggle = (type) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    setFilters(prev => ({ ...prev, type: newTypes }));
  };
  
  const handleAccountToggle = (accountName) => {
    const newAccounts = filters.account.includes(accountName)
      ? filters.account.filter(a => a !== accountName)
      : [...filters.account, accountName];
    setFilters(prev => ({ ...prev, account: newAccounts }));
  };

  // Determine which account chips to display based on the expanded state
  const accountsToShow = accountChipsExpanded || accounts.length <= 3
    ? accounts
    : accounts.slice(0, 3);

  return (
    <div className="modal-overlay visible z-50" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-4 text-center">Filters</h3>
        <div className="space-y-4">
          {/* Date Filters */}
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full filter-input" value={filters.startDate} onChange={e => setFilters(prev => ({...prev, startDate: e.target.value}))} />
            <input type="date" className="w-full filter-input" value={filters.endDate} onChange={e => setFilters(prev => ({...prev, endDate: e.target.value}))} />
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600">Type</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['Expense', 'Income', 'Transfer'].map(type => (
                <button key={type} onClick={() => handleTypeToggle(type)} className={`filter-chip ${filters.type.includes(type) ? 'selected' : ''}`}>{type}</button>
              ))}
            </div>
          </div>
          
          {/* Account Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600">Account</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {accountsToShow.map(acc => (
                 <button key={acc.id} onClick={() => handleAccountToggle(acc.name)} className={`filter-chip ${filters.account.includes(acc.name) ? 'selected' : ''}`}>{acc.name}</button>
              ))}
              {/* Show the '...' button only if there are more accounts to show */}
              {!accountChipsExpanded && accounts.length > 3 && (
                <button onClick={() => setAccountChipsExpanded(true)} className="filter-chip">...</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};