import React from 'react';

export const AmountInput = ({ value, onChange, error }) => (
  <div
    className={`floating-label-container bg-white dark:bg-slate-800 rounded-lg border-2 ${
      error ? 'border-red-600 dark:border-red-400' : 'border-transparent'
    }`}
  >
    <span className="icon-prefix font-medium text-lg text-gray-800 dark:text-gray-200">
      ₹
    </span>
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="floating-input text-gray-800 dark:text-gray-200"
      placeholder=" " // The space is important for the CSS selector to work
      required
    />
    <label
      htmlFor="tx-amount"
      className="floating-label text-gray-500 dark:text-gray-400"
    >
      Amount
    </label>
  </div>
);
