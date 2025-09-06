import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, limit, getDocs, startAfter } from 'firebase/firestore';
import { TransactionCard } from '../components/TransactionCard';
import { FilterSheet } from '../components/FilterSheet';
import { Spinner } from '../components/Spinner.jsx';

const PAGE_SIZE = 25;

export const AllTransactionsPage = ({ user, db, onEdit, onDelete, accounts, openSelectionSheet }) => {
  const [transactions, setTransactions] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  const buildQuery = useCallback((startAfterDoc = null) => {
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    let q = query(transactionsRef, orderBy(sort.by, sort.order));

    if (filters.startDate) {
      q = query(q, where('date', '>=', new Date(filters.startDate)));
    }
    if (filters.endDate) {
      // Add 1 day to end date to make it inclusive
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      q = query(q, where('date', '<', endDate));
    }
    if (filters.type.length > 0) {
      q = query(q, where('type', 'in', filters.type));
    }
    if (filters.account.length > 0) {
      q = query(q, where('involvedAccounts', 'array-contains-any', filters.account));
    }

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    q = query(q, limit(PAGE_SIZE));
    return q;
  }, [db, user.uid, sort, filters]);

  const fetchTransactions = useCallback(async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const q = buildQuery(loadMore ? lastVisible : null);

    try {
      const documentSnapshots = await getDocs(q);
      const newTransactions = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (!loadMore) setTransactions(newTransactions);
      else setTransactions(prev => [...prev, ...newTransactions]);

      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < 25) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Handle the error appropriately in your UI
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, lastVisible]);

  useEffect(() => {
    fetchTransactions();
  }, [filters, sort]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx =>
      !searchTerm
      || tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
      || tx.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

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
    if (sort.by !== 'date') return { 'all': filteredTransactions };

    return filteredTransactions.reduce((acc, tx) => {
      const dateKey = tx.date.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD format
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx)
      return acc;
    }, {});
  }, [filteredTransactions, sort.by]);

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
      // After deletion, we should refetch to get a clean state
      fetchTransactions();           
    }
    toggleSelectionMode();
  };

  return (
    <>
      <div className="page active text-gray-800 dark:text-gray-200 min-h-screen">
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900 pt-4 px-4 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {isSelecting ? (
              <>
                <button onClick={toggleSelectionMode} className="material-symbols-outlined">close</button>
                <span className="font-medium">{selectedIds.size} selected</span>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="material-symbols-outlined text-red-600 dark:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-600">delete</button>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <h1 className="text-2xl font-medium">All Transactions</h1>
                </div>
                <button onClick={toggleSelectionMode} className="p-2 material-symbols-outlined">select</button>
              </>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-grow relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-lg p-3 pl-10 shadow-sm placeholder-gray-500 dark:placeholder-gray-400 border border-transparent focus:border-blue-500 focus:ring-0 outline-none"
                placeholder="Search..."
              />
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">filter_list</span>
            </button>
            <button onClick={handleSortClick} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">sort</span>
            </button>
          </div>
        </div>

        {/* Transaction List */}
        {loading ? <Spinner /> : (
        <div className="space-y-4 px-4 pb-4">
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([dateKey, txs]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-2">{new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <div className="space-y-3">
                  {txs.map(tx => <TransactionCard key={tx.id} transaction={tx} isSelecting={isSelecting} isSelected={selectedIds.has(tx.id)} onClick={handleCardClick} />)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No transactions found.</p>
          )}
          {hasMore && (
            <div className="text-center mt-6">
                <button
                  onClick={() => fetchTransactions(true)}
                  disabled={loadingMore}
                  className="text-blue-600 dark:text-blue-400 font-medium disabled:opacity-50">
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
          )}
        </div>
        )}
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