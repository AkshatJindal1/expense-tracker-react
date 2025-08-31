import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// This registration is necessary for Chart.js v3+ with react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = ({ transactions, onBack }) => {

  // useMemo will recalculate analytics data only when the transactions prop changes
  const analyticsData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = transactions.filter(
      (t) => t.date && t.date.toDate() >= startOfMonth && t.type === 'Expense'
    );
    const monthlyExpensesWithoutAdjustment = monthlyExpenses.filter(
      (t) => !t.category.includes("Adjustment")
    );

    const totalMonthlySpend = monthlyExpenses.reduce((sum, tx) => sum + tx.amount - (tx.splitAmount || 0), 0);
    const totalMonthlySpendWithoutAdjustment =
      monthlyExpensesWithoutAdjustment.reduce(
        (sum, tx) => sum + tx.amount - (tx.splitAmount || 0),
        0
      );
    const avgDailySpend = totalMonthlySpend / now.getDate();
    const avgTxSpend = monthlyExpensesWithoutAdjustment.length > 0 ? totalMonthlySpendWithoutAdjustment / monthlyExpensesWithoutAdjustment.length : 0;

    const categoryTotals = monthlyExpenses.reduce((acc, tx) => {
      const category = tx.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (tx.amount - (tx.splitAmount || 0));
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const sortedCategoriesWithoutAdjustment = sortedCategories.filter((c) => !c[0].includes("Adjustment"));

    // Bar Chart Data Calculation ---
    const monthlySpending = {};
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Avoid issues with different month lengths
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthlySpending[monthKey] = 0;
      monthLabels.push(d.toLocaleString("default", { month: "short" }));
    }

    transactions
      .filter((t) => t.type === "Expense")
      .forEach((tx) => {
        const txDate = tx.date.toDate();
        const monthKey = `${txDate.getFullYear()}-${txDate.getMonth()}`;
        if (monthlySpending.hasOwnProperty(monthKey)) {
          monthlySpending[monthKey] += tx.amount - (tx.splitAmount || 0);
        }
      });

    const barChartData = Object.values(monthlySpending);

    return { avgDailySpend, avgTxSpend, sortedCategories, sortedCategoriesWithoutAdjustment, totalMonthlySpend, totalMonthlySpendWithoutAdjustment, monthLabels, barChartData };
  }, [transactions]);

  // Data for the Doughnut chart
  const doughnutChartData = {
    labels: analyticsData.sortedCategoriesWithoutAdjustment.map(c => c[0]),
    datasets: [
      {
        data: analyticsData.sortedCategoriesWithoutAdjustment.map(c => c[1]),
        backgroundColor: ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#AB47BC", "#00ACC1", "#FF7043"],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Data for the Bar chart
  const barChartData = {
    labels: analyticsData.monthLabels,
    datasets: [{
      label: 'Total Spending',
      data: analyticsData.barChartData,
      backgroundColor: '#4285F4',
      borderRadius: 4,
    }]
  };

  return (
    <div className="page p-4 active">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="material-symbols-outlined mr-2">arrow_back</button>
        <h1 className="text-2xl font-medium text-gray-800">Analytics</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-500">Avg. Daily Spend</p>
          <p className="text-lg font-medium text-gray-800">
            {analyticsData.avgDailySpend.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-500">Avg. Transaction</p>
          <p className="text-lg font-medium text-gray-800">
            {analyticsData.avgTxSpend.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-base font-medium mb-3 text-gray-700">Month-on-Month Spending</h2>
        <Bar
          data={barChartData}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { callback: (value) => `₹${value / 1000}k` },
              },
              x: { grid: { display: false } }
            }
          }} />
      </div>

      {analyticsData.sortedCategoriesWithoutAdjustment.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-base font-medium mb-3 text-gray-700">
            Spending for {new Date().toLocaleString('default', { month: 'long' })}
          </h2>
          <Doughnut data={doughnutChartData} options={{ plugins: { legend: { display: false } } }} />
          {(() => {
            if (analyticsData.totalMonthlySpendWithoutAdjustment === 0) return null;
            return doughnutChartData.labels.map((label, index) => (
              <div key={label} className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index % doughnutChartData.datasets[0].backgroundColor.length] }} />
                  <span>{label}</span>
                </div>
                <span>{((doughnutChartData.datasets[0].data[index] / analyticsData.totalMonthlySpendWithoutAdjustment) * 100).toFixed(1)}%</span>
              </div>
            ));
          })()}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-base font-medium mb-3 text-gray-700">This Month's Spending by Category</h2>
        <div id="category-summary-list">
          {analyticsData.sortedCategories.map(([name, total]) => (
            <div key={name} className="flex justify-between items-center py-2 border-b">
              <span className="font-normal">{name}</span>
              <span className="font-medium">{total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;