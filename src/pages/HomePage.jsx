import React, { useState, useMemo, useEffect } from 'react';
import { TransactionCard } from '../components/TransactionCard';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const HomePage = ({
  user,
  transactions,
  accounts,
  onNavigate,
  onEditTxn,
}) => {
  const [expandedSummary, setExpandedSummary] = useState(null); // 'Income', 'Spending', or null
  const [expandedBalances, setExpandedBalances] = useState({}); // e.g., { 'Bank': true }
  const [summaryData, setSummaryData] = useState({
    daily: { income: 0, expense: 0 },
    weekly: { income: 0, expense: 0 },
    monthly: { income: 0, expense: 0 },
  });

  const userName = user?.displayName || user?.email?.split('@')[0] || 'There';

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!user) return;
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        // Fetch monthly summary
        const monthId = `${year}-${month}`;
        const monthlyAnalyticsRef = collection(
          db,
          `analytics/${user.uid}/monthly`
        );
        const monthlyQuery = query(
          monthlyAnalyticsRef,
          where('__name__', '==', monthId)
        );
        const monthlySnap = await getDocs(monthlyQuery);
        const monthlyDoc = monthlySnap.docs[0]?.data() || {
          totalIncome: 0,
          totalExpense: 0,
        };

        // Fetch last 7 daily summaries for weekly calculation
        const dailyAnalyticsRef = collection(db, `analytics/${user.uid}/daily`);
        const dailyQuery = query(
          dailyAnalyticsRef,
          orderBy('__name__', 'desc'),
          limit(7)
        );
        const dailySnap = await getDocs(dailyQuery);

        let weeklyIncome = 0;
        let weeklyExpense = 0;
        let dailyIncome = 0;
        let dailyExpense = 0;

        const todayId = `${monthId}-${day}`;

        dailySnap.docs.forEach((doc) => {
          const data = doc.data();
          // Check if doc ID is within the last 7 days from today
          const docDate = new Date(doc.id);
          const diffTime = Math.abs(now - docDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 7) {
            weeklyIncome += data.totalIncome || 0;
            weeklyExpense += data.totalExpense || 0;
          }

          if (doc.id === todayId) {
            dailyIncome = data.totalIncome || 0;
            dailyExpense = data.totalExpense || 0;
          }
        });

        setSummaryData({
          daily: { income: dailyIncome, expense: dailyExpense },
          weekly: { income: weeklyIncome, expense: weeklyExpense },
          monthly: {
            income: monthlyDoc.totalIncome || 0,
            expense: monthlyDoc.totalExpense || 0,
          },
        });
      } catch (error) {
        console.error('Error fetching summaries:', error);
      }
    };

    fetchSummaries();
  }, [user, transactions]);

  const accountBalances = useMemo(() => {
    if (!accounts || accounts.length === 0) return {};

    const grouped = {};
    accounts.forEach((acc) => {
      if (!grouped[acc.type]) {
        grouped[acc.type] = { total: 0, accounts: [] };
      }
      const balance = acc.balance || 0;
      grouped[acc.type].total += balance;
      grouped[acc.type].accounts.push({ name: acc.name, balance });
    });

    return grouped;
  }, [accounts]);

  const recentTransactions = transactions
    .filter((tx) => !tx.category.includes('Adjustment'))
    .slice(0, 3);

  const accountTypeIcons = {
    Bank: 'account_balance',
    'Credit Card': 'credit_card',
    Wallet: 'account_balance_wallet',
    Splitwise: 'receipt_long',
  };

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-medium truncate">Hello, {userName}</h1>
      </header>

      {/* Dashboard Summary Section */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6 space-y-2">
        {/* Income Row */}
        <div
          onClick={() =>
            setExpandedSummary(expandedSummary === 'Income' ? null : 'Income')
          }
        >
          <div className="summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-green-600 dark:text-green-400">
                arrow_downward
              </span>
              <span className="font-medium">Income</span>
            </div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {summaryData.monthly.income.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </div>
          </div>
          {expandedSummary === 'Income' && (
            <div className="balance-detail-row expanded pl-4 border-l-2 border-gray-200 dark:border-slate-700 ml-4">
              <div
                key="Today"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">Today</span>
                <span className="font-normal">
                  {summaryData.daily.income.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
              <div
                key="This Week"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  This Week
                </span>
                <span className="font-normal">
                  {summaryData.weekly.income.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
              <div
                key="This Month"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  This Month
                </span>
                <span className="font-normal">
                  {summaryData.monthly.income.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Spending Row */}
        <div
          onClick={() =>
            setExpandedSummary(
              expandedSummary === 'Spending' ? null : 'Spending'
            )
          }
        >
          <div className="summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-red-600 dark:text-red-400">
                arrow_upward
              </span>
              <span className="font-medium">Spending</span>
            </div>
            <div className="font-medium text-red-600 dark:text-red-400">
              {summaryData.monthly.expense.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </div>
          </div>
          {expandedSummary === 'Spending' && (
            <div className="balance-detail-row expanded pl-4 border-l-2 border-gray-200 dark:border-slate-700 ml-4">
              <div
                key="Today"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">Today</span>
                <span className="font-normal">
                  {summaryData.daily.expense.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
              <div
                key="This Week"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  This Week
                </span>
                <span className="font-normal">
                  {summaryData.weekly.expense.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
              <div
                key="This Month"
                className="flex justify-between items-center text-sm ml-8 py-1"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  This Month
                </span>
                <span className="font-normal">
                  {summaryData.monthly.expense.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Balances Section */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
          Current Balances
        </h2>
        <div className="space-y-2">
          {Object.entries(accountBalances).map(([type, group]) => (
            <div key={type}>
              <div
                className="balance-summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() =>
                  setExpandedBalances((prev) => ({
                    ...prev,
                    [type]: !prev[type],
                  }))
                }
              >
                <div className="flex items-center">
                  <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">
                    {accountTypeIcons[type] || 'credit_score'}
                  </span>
                  <span className="font-medium">{type}</span>
                </div>
                <div
                  className={`font-medium ${group.total < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {group.total.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </div>
              </div>
              {expandedBalances[type] && (
                <div className="balance-detail-row expanded pl-4 border-l-2 border-gray-200 dark:border-slate-700 ml-4">
                  {group.accounts.map((acc) => (
                    <div
                      key={acc.name}
                      className="flex justify-between items-center text-sm ml-8 py-1"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {acc.name}
                      </span>
                      <span className="font-normal">
                        {acc.balance.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
            Recent Transactions
          </h2>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            See All123
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onClick={onEditTxn}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No recent transactions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
