import React, { useState, useMemo } from 'react';
import { TransactionCard } from '../components/TransactionCard';
import { FilterSheet } from '../components/FilterSheet';

export const AllTransactionsPage = ({ transactions, onEdit, onDelete, accounts, openSelectionSheet }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: [],
    account: [],
  });
  const [sort, setSort] = useState({ by: 'date', order: 'desc' });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // useMemo efficiently recalculates the displayed transactions only when data or filters change.
  const filteredAndSortedTransactions = useMemo(() => {
    let processed = [...transactions];

    // Filtering logic
    processed = processed.filter(tx => {
      const searchTermMatch = !searchTerm || tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const startDateMatch = !filters.startDate || tx.date.toDate() >= new Date(filters.startDate);
      const endDateMatch = !filters.endDate || tx.date.toDate() <= new Date(filters.endDate);
      const typeMatch = filters.type.length === 0 || filters.type.includes(tx.type);
      const accountMatch = filters.account.length === 0 || filters.account.includes(tx.source) || filters.account.includes(tx.destination);
      return searchTermMatch && startDateMatch && endDateMatch && typeMatch && accountMatch;
    });

    // Sorting logic
    processed.sort((a, b) => {
      if (sort.by === 'date') {
        return sort.order === 'asc' ? a.date.toMillis() - b.date.toMillis() : b.date.toMillis() - a.date.toMillis();
      }
      if (sort.by === 'amount') {
        return sort.order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

    return processed;
  }, [transactions, searchTerm, filters, sort]);

  const getCurrentSortLabel = () => {
    if (sort.by === 'date' && sort.order === 'desc') return 'Date (Newest First)';
    if (sort.by === 'date' && sort.order === 'asc') return 'Date (Oldest First)';
    if (sort.by === 'amount' && sort.order === 'desc') return 'Amount (High to Low)';
    if (sort.by === 'amount' && sort.order === 'asc') return 'Amount (Low to High)';
    return '';
  };

  const handleSortClick = () => {
    const items = [
      { value: 'Date (Newest First)' },
      { value: 'Date (Oldest First)' },
      { value: 'Amount (High to Low)' },
      { value: 'Amount (Low to High)' },
    ];
    openSelectionSheet('Sort By', items, getCurrentSortLabel(), (value) => {
      if (value.includes('Date')) setSort({ by: 'date', order: value.includes('Newest') ? 'desc' : 'asc' });
      if (value.includes('Amount')) setSort({ by: 'amount', order: value.includes('High') ? 'desc' : 'asc' });
    });
  };

  // Group transactions by date for rendering
  const groupedTransactions = useMemo(() => {
    if (sort.by !== 'date') return { 'all': filteredAndSortedTransactions };

    return filteredAndSortedTransactions.reduce((acc, tx) => {
      const dateKey = tx.date.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD format
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx);
      return acc;
    }, {});
  }, [filteredAndSortedTransactions, sort.by]);

  const handleCardClick = (tx) => {
    if (isSelecting) {
      const newIds = new Set(selectedIds);
      if (newIds.has(tx.id)) newIds.delete(tx.id);
      else newIds.add(tx.id);
      setSelectedIds(newIds);
    } else {
      onEdit(tx);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelecting(!isSelecting);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      onDelete(Array.from(selectedIds));
    }
    toggleSelectionMode();
  };

  return (
    <>
      <div className="page active">
        <div className="sticky top-0 z-10 bg-gray-50 pt-4 px-4 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {isSelecting ? (
              <>
                <button onClick={toggleSelectionMode} className="material-symbols-outlined">close</button>
                <span className="font-medium">{selectedIds.size} selected</span>
                <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0} className="material-symbols-outlined text-red-600 disabled:text-gray-400">delete</button>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <h1 className="text-2xl font-medium text-gray-800">All Transactions</h1>
                </div>
                <button onClick={toggleSelectionMode} className="p-2 material-symbols-outlined">select</button>
              </>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-grow relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white rounded-lg p-3 pl-10 shadow-sm"
                placeholder="Search..."
              />
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-white rounded-lg shadow-sm">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button onClick={handleSortClick} className="p-3 bg-white rounded-lg shadow-sm">
              <span className="material-symbols-outlined">sort</span>
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4 px-4 pb-4">
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([dateKey, txs]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">{new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <div className="space-y-3">
                  {txs.map(tx => <TransactionCard key={tx.id} transaction={tx} isSelecting={isSelecting} isSelected={selectedIds.has(tx.id)} onClick={handleCardClick} />)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-8">No transactions found.</p>
          )}
        </div>
      </div>

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        accounts={accounts}
      />
    </>
  );
};