import React, { useState } from 'react';

export const AdjustmentPage = ({
  onBack,
  onSave,
  accounts,
  openSelectionSheet,
}) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actualBalance, setActualBalance] = useState('');
  const [errors, setErrors] = useState({});

  const appBalance = selectedAccount ? selectedAccount.balance || 0 : 0;
  const difference =
    actualBalance !== '' ? parseFloat(actualBalance) - appBalance : 0;

  const validate = () => {
    const newErrors = {};
    if (!selectedAccount) newErrors.account = 'Please select an account.';
    if (actualBalance === '')
      newErrors.actualBalance = 'Please enter the actual balance.';
    return newErrors;
  };

  const handleAccountSelect = () => {
    const items = accounts.map((a) => ({ value: a.name, subtext: a.type }));
    openSelectionSheet(
      'Select Account',
      items,
      selectedAccount?.name,
      (value) => {
        const account = accounts.find((a) => a.name === value);
        setSelectedAccount(account);
        setActualBalance(''); // Reset input when a new account is selected
        if (errors.account) setErrors({ ...errors, account: '' });
      }
    );
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (difference === 0) return;
    onSave(selectedAccount.name, difference);
  };

  return (
    <div className="page p-4 active   text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="material-symbols-outlined mr-2">
          arrow_back
        </button>
        <h1 className="text-2xl font-medium">Adjust Balance</h1>
      </div>
      <div className="space-y-4">
        <div
          onClick={handleAccountSelect}
          className={`selection-input bg-white dark:bg-slate-800 p-3 rounded-lg cursor-pointer flex justify-between items-center ${
            errors.account ? 'border border-red-600 dark:border-red-400' : ''
          }`}
        >
          <span>{selectedAccount?.name || 'Select Account to Adjust'}</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
        {errors.account && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            {errors.account}
          </p>
        )}

        {selectedAccount && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Balance in App
              </label>
              <p className="text-base">
                {appBalance.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                })}
              </p>
            </div>
            <div>
              <label
                htmlFor="adj-actual-balance"
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                Actual Balance
              </label>
              <input
                type="number"
                id="adj-actual-balance"
                value={actualBalance}
                onChange={(e) => {
                  setActualBalance(e.target.value);
                  if (errors.actualBalance)
                    setErrors({ ...errors, actualBalance: '' });
                }}
                className={`w-full bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-gray-600 rounded-lg p-3 mt-1 ${
                  errors.actualBalance
                    ? 'border border-red-600 dark:border-red-400'
                    : ''
                }`}
                placeholder="Enter actual balance"
              />
              {errors.actualBalance && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.actualBalance}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Difference
              </label>
              <p
                className={`text-base font-medium ${
                  difference > 0
                    ? 'text-green-600 dark:text-green-400'
                    : difference < 0
                      ? 'text-red-600 dark:text-red-400'
                      : ''
                }`}
              >
                {difference.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                })}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white font-medium p-3 rounded-lg disabled:bg-gray-400 dark:disabled:bg-slate-700 dark:disabled:text-gray-500"
          disabled={!selectedAccount || difference === 0}
        >
          Save Adjustment
        </button>
      </div>
    </div>
  );
};
