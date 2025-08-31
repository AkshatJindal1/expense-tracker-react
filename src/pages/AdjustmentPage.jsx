import React, { useState } from 'react';

const AdjustmentPage = ({ onBack, onSave, accounts, currentBalances, openSelectionSheet }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actualBalance, setActualBalance] = useState('');

  const appBalance = selectedAccount ? currentBalances[selectedAccount.name] || 0 : 0;
  const difference = actualBalance !== '' ? parseFloat(actualBalance) - appBalance : 0;

  const handleAccountSelect = () => {
    const items = accounts.map(a => ({ value: a.name, subtext: a.type }));
    openSelectionSheet('Select Account', items, selectedAccount?.name, (value) => {
      const account = accounts.find(a => a.name === value);
      setSelectedAccount(account);
      setActualBalance(''); // Reset input when a new account is selected
    });
  };

  const handleSave = () => {
    if (!selectedAccount || difference === 0) return;
    onSave(selectedAccount.name, difference);
  };

  return (
    <div className="page p-4 active">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="material-symbols-outlined mr-2">arrow_back</button>
        <h1 className="text-2xl font-medium text-gray-800">Adjust Balance</h1>
      </div>
      <div className="space-y-4">
        <div onClick={handleAccountSelect} className="selection-input">
          <span>{selectedAccount?.name || 'Select Account to Adjust'}</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>

        {selectedAccount && (
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-500">Balance in App</label>
              <p className="text-base">{appBalance.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
            </div>
            <div>
              <label htmlFor="adj-actual-balance" className="text-sm text-gray-500">Actual Balance</label>
              <input
                type="number"
                id="adj-actual-balance"
                value={actualBalance}
                onChange={(e) => setActualBalance(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 rounded-lg p-3 mt-1"
                placeholder="Enter actual balance"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Difference</label>
              <p className={`text-base font-medium ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}`}>
                {difference.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg disabled:bg-gray-400"
          disabled={!selectedAccount || difference === 0}
        >
          Save Adjustment
        </button>
      </div>
    </div>
  );
};

export default AdjustmentPage;