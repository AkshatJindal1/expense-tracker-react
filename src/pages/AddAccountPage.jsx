import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export const AddAccountPage = ({
  onSave,
  onBack,
  onDelete,
  openSelectionSheet,
  showError,
}) => {
  const location = useLocation();
  const initialData = location.state?.initialData;
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || '');
  const [initialBalance, setInitialBalance] = useState(
    initialData?.balance || '0'
  );

  const handleSave = () => {
    if (!name || !type) {
      showError('Please fill all fields.');
      return;
    }
    const accountData = {
      id: initialData?.id,
      name,
      type,
      balance: parseFloat(initialBalance) || 0,
    };
    // Don't update balance if editing, only set on creation
    if (isEditing) {
      delete accountData.balance;
    }
    onSave(accountData);
  };

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button onClick={onBack} className="material-symbols-outlined mr-2">
            arrow_back
          </button>
          <h1 className="text-2xl font-medium">
            {isEditing ? 'Edit Account' : 'Add Account'}
          </h1>
        </div>
        {isEditing && (
          <button
            onClick={() => onDelete(initialData.id)}
            className="text-red-600 dark:text-red-400 material-symbols-outlined"
          >
            delete
          </button>
        )}
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account Name"
          className="w-full bg-gray-100 dark:bg-slate-700 p-3 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 border border-transparent focus:border-blue-500 focus:ring-0 outline-none"
        />
        <div
          onClick={() =>
            openSelectionSheet(
              'Select Type',
              ['Bank', 'Credit Card', 'Wallet', 'Splitwise'],
              type,
              setType
            )
          }
          className="form-row cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center">
            <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">
              category
            </span>
            <span className="form-label text-gray-800 dark:text-gray-200">
              Type
            </span>
          </div>
          <span className="form-value text-gray-600 dark:text-gray-300">
            {type || 'Select Type'}
          </span>
        </div>
        {!isEditing && (
          <div>
            <label className="text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 px-1">
              Inital Balance
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-700 p-3 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 border border-transparent focus:border-blue-500 focus:ring-0 outline-none"
            />
          </div>
        )}
      </div>
      <button
        onClick={handleSave}
        className="fab save-fab bg-blue-600 dark:bg-blue-500 text-white"
      >
        <span className="material-symbols-outlined">save</span>
      </button>
    </div>
  );
};
