import React, { useMemo, useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext.jsx';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Spinner } from '../components/Spinner.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsPage = ({ user, onBack, showError }) => {
  const { resolvedTheme } = useTheme();
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  useEffect(() => {
    if (monthlySummaries.length > 0) {
      setSelectedMonthData(monthlySummaries[monthlySummaries.length - 1]);
    }
  }, [monthlySummaries]);

  // Define chart colors based on the current theme
  const textColor =
    resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(0, 0, 0, 0.8)';
  const gridColor =
    resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';
  const lightModeColors = [
    '#4285F4',
    '#DB4437',
    '#F4B400',
    '#0F9D58',
    '#AB47BC',
    '#00ACC1',
    '#FF7043',
    '#795548',
  ];
  const darkModeColors = [
    '#8AB4F8',
    '#F28B82',
    '#FDD663',
    '#81C995',
    '#C58AF9',
    '#78D9EC',
    '#FFAB91',
    '#BCAAA4',
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, `analytics/${user.uid}/monthly`),
          orderBy('__name__', 'desc'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const summaries = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .reverse();
        setMonthlySummaries(summaries);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showError('Failed to load analytics. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, showError]);

  const analyticsData = useMemo(() => {
    if (monthlySummaries.length === 0 || !selectedMonthData) {
      return {
        avgDailySpend: 0,
        avgTxSpend: 0,
        sortedCategories: [],
        sortedCategoriesWithoutAdjustment: [],
        totalMonthlySpend: 0,
        totalMonthlySpendWithoutAdjustment: 0,
        monthLabels: [],
        barChartData: [],
        doughnutChartData: { labels: [], datasets: [{ data: [] }] },
      };
    }

    const totalMonthlySpend = selectedMonthData.totalExpense || 0;
    const transactionCount = selectedMonthData.numExpenseTransactions || 0;
    const expenseCategoryTotals = selectedMonthData.expenseCategoryTotals || {};

    const sortedCategories = Object.entries(expenseCategoryTotals).sort(
      (a, b) => b[1] - a[1]
    );
    const sortedCategoriesWithoutAdjustment = sortedCategories.filter(
      (c) => !c[0].includes('Adjustment')
    );
    const totalMonthlySpendWithoutAdjustment =
      sortedCategoriesWithoutAdjustment.reduce(
        (sum, [, amount]) => sum + amount,
        0
      );

    const monthLabels = monthlySummaries.map((s) =>
      new Date(s.id + '-02').toLocaleString('default', { month: 'short' })
    );
    const barChartDataValues = monthlySummaries.map((s) => s.totalExpense || 0);

    const doughnutLabels = sortedCategoriesWithoutAdjustment.map((c) => c[0]);
    const doughnutData = sortedCategoriesWithoutAdjustment.map((c) => c[1]);

    const avgDailySpend = totalMonthlySpend / new Date().getDate();
    const avgTxSpend =
      transactionCount > 0 ? totalMonthlySpend / transactionCount : 0;

    return {
      avgDailySpend,
      avgTxSpend,
      sortedCategories,
      totalMonthlySpend,
      totalMonthlySpendWithoutAdjustment,
      monthLabels,
      barChartData: barChartDataValues,
      doughnutChartData: {
        labels: doughnutLabels,
        datasets: [
          {
            data: doughnutData,
            backgroundColor:
              resolvedTheme === 'dark' ? darkModeColors : lightModeColors,
            borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
            borderWidth: 2,
          },
        ],
      },
    };
  }, [monthlySummaries, resolvedTheme, selectedMonthData]);

  const handleBarClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      setSelectedMonthData(monthlySummaries[clickedIndex]);
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, callback: (value) => `₹${value / 1000}k` },
        grid: { color: gridColor },
      },
      x: { ticks: { color: textColor }, grid: { display: false } },
    },
    onClick: handleBarClick,
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="material-symbols-outlined mr-2">
          arrow_back
        </button>
        <h1 className="text-2xl font-medium">Analytics</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Avg. Daily Spend
          </p>
          <p className="text-lg font-medium">
            {analyticsData.avgDailySpend.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Avg. Transaction
          </p>
          <p className="text-lg font-medium">
            {analyticsData.avgTxSpend.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6 h-64">
        <h2 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
          Month-on-Month Spending
        </h2>
        <Bar
          data={{
            labels: analyticsData.monthLabels,
            datasets: [
              {
                label: 'Total Spending',
                data: analyticsData.barChartData,
                backgroundColor:
                  resolvedTheme === 'dark' ? '#8AB4F8' : '#4285F4',
                borderRadius: 4,
              },
            ],
          }}
          options={barChartOptions}
        />
      </div>

      {analyticsData.doughnutChartData.labels.length > 0 &&
        selectedMonthData && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
              Spending for{' '}
              {new Date(selectedMonthData.id + '-02').toLocaleString(
                'default',
                { month: 'long' }
              )}
            </h2>
            <div className="h-64 mb-4">
              <Doughnut
                data={analyticsData.doughnutChartData}
                options={doughnutOptions}
              />
            </div>
            {analyticsData.totalMonthlySpendWithoutAdjustment > 0 &&
              analyticsData.doughnutChartData.labels.map((label, index) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center">
                    <span
                      className="w-4 h-4 rounded-full mr-3"
                      style={{
                        backgroundColor:
                          analyticsData.doughnutChartData.datasets[0]
                            .backgroundColor[
                            index %
                              analyticsData.doughnutChartData.datasets[0]
                                .backgroundColor.length
                          ],
                      }}
                    />
                    <span>{label}</span>
                  </div>
                  <span>
                    {(
                      (analyticsData.doughnutChartData.datasets[0].data[index] /
                        analyticsData.totalMonthlySpendWithoutAdjustment) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              ))}
          </div>
        )}

      {selectedMonthData && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
            Spending by Category
          </h2>
          <div id="category-summary-list">
            {analyticsData.sortedCategories.map(([name, total]) => (
              <div
                key={name}
                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700"
              >
                <span className="font-normal">{name}</span>
                <span className="font-medium">
                  {total.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
