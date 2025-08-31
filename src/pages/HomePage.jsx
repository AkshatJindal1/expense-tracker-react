import React, { useState, useMemo } from 'react';
import { TransactionCard } from '../components/TransactionCard';

const HomePage = ({ user, transactions, accounts, onNavigate }) => {
  const [expandedSummary, setExpandedSummary] = useState(null); // 'Income', 'Spending', or null
  const [expandedBalances, setExpandedBalances] = useState({}); // e.g., { 'Bank': true }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'There';

  // useMemo will re-calculate the dashboard summary only when `transactions` change.
  const dashboardSummary = useMemo(() => {
    if (!transactions) {
      return {
        daily: { income: 0, expense: 0 },
        weekly: { income: 0, expense: 0 },
        monthly: { income: 0, expense: 0 },
      }
    }

    const calculateIncomeExpense = (txs) => {
      return txs.reduce(
        (acc, tx) => {
          if (tx.type === 'Income') {
            acc.income += tx.amount;
          } else if (tx.type === 'Expense') {
            acc.expense += tx.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
    };

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyTransactions = transactions.filter(
      (t) => t.date && t.date.toDate() >= startOfDay
    );
    const weeklyTransactions = transactions.filter(
      (t) => t.date && t.date.toDate() >= startOfWeek
    );
    const monthlyTransactions = transactions.filter(
      (t) => t.date && t.date.toDate() >= startOfMonth
    );
    const dailySummary = calculateIncomeExpense(dailyTransactions);
    const weeklySummary = calculateIncomeExpense(weeklyTransactions);
    const monthlySummary = calculateIncomeExpense(monthlyTransactions);

    return {
      daily: dailySummary,
      weekly: weeklySummary,
      monthly: monthlySummary,
    };
  }, [transactions]);

  // useMemo will re-calculate balances only when `transactions` or `accounts` change.
  const accountBalances = useMemo(() => {
    if (!accounts || accounts.length === 0) return {};

    const balances = accounts.reduce((acc, account) => ({ ...acc, [account.name]: 0 }), {});

    transactions.forEach((tx) => {
      if (tx.type === "Transfer") {
        if (balances.hasOwnProperty(tx.source)) balances[tx.source] -= tx.amount;
        if (balances.hasOwnProperty(tx.destination)) balances[tx.destination] += tx.amount;
      }
      if (tx.type === "Income") {
        if (balances.hasOwnProperty(tx.destination)) balances[tx.destination] += tx.amount;
      }
      if (tx.type === "Expense") {
        if (balances.hasOwnProperty(tx.source)) balances[tx.source] -= tx.amount;
      }
      if (tx.splitAmount > 0) {
        const splitwiseAccount = accounts.find(
          (a) => a.type === "Splitwise"
        );
        if (splitwiseAccount && balances.hasOwnProperty(splitwiseAccount.name)) {
          balances[splitwiseAccount.name] += tx.splitAmount;
        }
      }
    });

    // Group balances by account type
    const grouped = {};
    accounts.forEach(acc => {
      if (!grouped[acc.type]) {
        grouped[acc.type] = { total: 0, accounts: [] };
      }
      const balance = balances[acc.name] || 0;
      grouped[acc.type].total += balance;
      grouped[acc.type].accounts.push({ name: acc.name, balance });
    });

    return grouped;
  }, [transactions, accounts]);

  const recentTransactions = transactions
    .filter((tx) => !tx.category.includes("Adjustment"))
    .slice(0, 3);

  const accountTypeIcons = {
    Bank: "account_balance",
    "Credit Card": "credit_card",
    Wallet: "account_balance_wallet",
    Splitwise: "receipt_long",
  };

  return (
    <div className="page p-4 active">
      <header className="mb-6">
        <h1 className="text-2xl font-medium text-gray-800 truncate">
          Hello, {userName}
        </h1>
      </header>

      {/* Dashboard Summary Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-2">
        {/* Income Row */}
        <div onClick={() => setExpandedSummary(expandedSummary === 'Income' ? null : 'Income')}>
          <div className="summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-green-600">arrow_downward</span>
              <span className="font-medium">Income</span>
            </div>
            <div className="font-medium text-green-600">
              {dashboardSummary.monthly.income.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
            </div>
          </div>
          {expandedSummary === 'Income' && (
            <div className="balance-detail-row expanded pl-4 border-l-2 ml-4">
              <div key="Today" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">Today</span>
                <span className="font-normal">{dashboardSummary.daily.income.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div key="This Week" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">This Week</span>
                <span className="font-normal">{dashboardSummary.weekly.income.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div key="This Month" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">This Month</span>
                <span className="font-normal">{dashboardSummary.monthly.income.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
            </div>
          )}
        </div>
        {/* Spending Row */}
        <div onClick={() => setExpandedSummary(expandedSummary === 'Spending' ? null : 'Spending')}>
          <div className="summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-red-600">arrow_upward</span>
              <span className="font-medium">Spending</span>
            </div>
            <div className="font-medium text-red-600">
              {dashboardSummary.monthly.expense.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
            </div>
          </div>
          {expandedSummary === 'Spending' && (
            <div className="balance-detail-row expanded pl-4 border-l-2 ml-4">
              <div key="Today" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">Today</span>
                <span className="font-normal">{dashboardSummary.daily.expense.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div key="This Week" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">This Week</span>
                <span className="font-normal">{dashboardSummary.weekly.expense.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div key="This Month" className="flex justify-between items-center text-sm ml-8 py-1">
                <span className="text-gray-600">This Month</span>
                <span className="font-normal">{dashboardSummary.monthly.expense.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
            </div>
          )
          }
        </div>
      </div>

      {/* Current Balances Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-base font-medium mb-3 text-gray-700">Current Balances</h2>
        <div className="space-y-2">
          {Object.entries(accountBalances).map(([type, group]) => (
            <div key={type}>
              <div
                className="balance-summary-row flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => setExpandedBalances(prev => ({ ...prev, [type]: !prev[type] }))}
              >
                <div className="flex items-center">
                  <span className="material-symbols-outlined mr-3 text-gray-500">{accountTypeIcons[type] || 'credit_score'}</span>
                  <span className="font-medium">{type}</span>
                </div>
                <div className={`font-medium ${group.total < 0 ? "text-red-600" : "text-gray-800"}`}>
                  {group.total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </div>
              </div>
              {expandedBalances[type] && (
                <div className="balance-detail-row expanded pl-4 border-l-2 ml-4">
                  {group.accounts.map(acc => (
                    <div key={acc.name} className="flex justify-between items-center text-sm ml-8 py-1">
                      <span className="text-gray-600">{acc.name}</span>
                      <span className="font-normal">{acc.balance.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
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
          <h2 className="text-base font-medium text-gray-700">Recent Transactions</h2>
          <button onClick={() => onNavigate('transactions')} className="text-sm font-medium text-blue-600">
            See All
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(tx => <TransactionCard key={tx.id} transaction={tx} />)
          ) : (
            <p className="text-center text-gray-500 py-4">No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 