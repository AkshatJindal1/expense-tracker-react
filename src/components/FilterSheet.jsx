import React, { useState, useEffect } from 'react';

export const FilterSheet = ({ isOpen, onClose, filters, setFilters, accounts }) => {
  // State to manage whether all account filter chips are shown
  const [accountChipsExpanded, setAccountChipsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    } else {
      setAccountChipsExpanded(false);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      type: [],
      account: [],
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onClose();
  };

  const handleTypeToggle = (type) => {
    const newTypes = localFilters.type.includes(type)
      ? localFilters.type.filter(t => t !== type)
      : [...localFilters.type, type];
    setLocalFilters(prev => ({ ...prev, type: newTypes }));
  };

  const handleAccountToggle = (accountName) => {
    const newAccounts = localFilters.account.includes(accountName)
      ? localFilters.account.filter(a => a !== accountName)
      : [...localFilters.account, accountName];
    setLocalFilters(prev => ({ ...prev, account: newAccounts }));
  };

  const accountsToShow = accountChipsExpanded || accounts.length <= 3
    ? accounts
    : accounts.slice(0, 3);
  return (
    <div className="modal-overlay visible z-50" onClick={onClose}>
      <div
        className="bottom-sheet bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button onClick={handleReset} className="text-sm text-blue-600 dark:text-blue-400">Reset</button>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Filters</h3>
          <button onClick={handleApply} className="text-sm font-medium text-blue-600 dark:text-blue-400">Apply</button>
        </div>
        <div className="space-y-4">
          {/* Date Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</label>
              <input
                type="date"
                className="w-full filter-input bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2"
                style={{ colorScheme: 'dark' }}
                value={localFilters.startDate}
                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">End Date</label>
              <input
                type="date"
                className="w-full filter-input bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2"
                style={{ colorScheme: 'dark' }}
                value={localFilters.endDate}
                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
            </div>

          </div>

          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['Expense', 'Income', 'Transfer'].map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`filter-chip ${localFilters.type.includes(type)
                    ? 'selected bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white border-transparent'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {accountsToShow.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleAccountToggle(acc.name)}
                  className={`filter-chip ${localFilters.account.includes(acc.name)
                    ? 'selected bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white border-transparent'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'}`}
                >
                  {acc.name}
                </button>
              ))}
              {/* Show the '...' button only if there are more accounts to show */}
              {!accountChipsExpanded && accounts.length > 3 && (
                <button
                  onClick={() => setAccountChipsExpanded(true)}
                  className="filter-chip bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600"
                >...</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};