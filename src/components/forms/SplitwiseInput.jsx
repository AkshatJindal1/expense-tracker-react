import React from 'react';

export const SplitwiseInput = ({ isSplit, onToggle, splitAmount, onAmountChange }) => {
  return (
    <>
      <div className="flex items-center justify-between p-2">
        <span className="text-sm">Add to Splitwise</span>
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
            className="w-full bg-gray-50 border-gray-300 rounded-lg p-3"
            placeholder="Amount for others (on Splitwise)"
          />
        </div>
      )}
    </>
  );
};