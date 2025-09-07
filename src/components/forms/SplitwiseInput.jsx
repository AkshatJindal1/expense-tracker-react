import React from 'react';

export const SplitwiseInput = ({
  isSplit,
  onToggle,
  splitAmount,
  onAmountChange,
}) => {
  return (
    <>
      <div className="flex items-center justify-between p-2">
        <span className="text-sm text-gray-800 dark:text-gray-200">
          Add to Splitwise
        </span>
        <label className="m3-switch">
          <input
            type="checkbox"
            checked={isSplit}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="m3-slider"></span>
        </label>
      </div>
      {isSplit && (
        <div>
          <input
            type="number"
            step="0.01"
            value={splitAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-700 p-3 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 border border-transparent focus:border-blue-500 focus:ring-0 outline-none"
            placeholder="Amount for others (on Splitwise)"
          />
        </div>
      )}
    </>
  );
};
