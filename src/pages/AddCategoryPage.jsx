import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export const AddCategoryPage = ({
  onSave,
  onBack,
  onDelete,
  openSelectionSheet,
}) => {
  const location = useLocation();
  const initialData = location.state?.initialData;
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [transactionType, setTransactionType] = useState(
    initialData?.transactionType || ''
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Category name is required.';
    if (!transactionType)
      newErrors.transactionType = 'Transaction type is required.';
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ id: initialData?.id, name, transactionType });
  };

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button onClick={onBack} className="material-symbols-outlined mr-2">
            arrow_back
          </button>
          <h1 className="text-2xl font-medium">
            {isEditing ? 'Edit Category' : 'Add Category'}
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
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="Category Name"
          className={`w-full bg-gray-100 dark:bg-slate-700 p-3 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 border ${
            errors.name
              ? 'border-red-600 dark:border-red-400'
              : 'border-transparent'
          } focus:border-blue-500 focus:ring-0 outline-none`}
        />
        {errors.name && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            {errors.name}
          </p>
        )}
        <div
          onClick={() => {
            openSelectionSheet(
              'Select Transaction Type',
              ['Expense', 'Income', 'Transfer'],
              transactionType,
              setTransactionType
            );
            if (errors.transactionType)
              setErrors({ ...errors, transactionType: '' });
          }}
          className={`form-row cursor-pointer bg-white dark:bg-slate-800 p-3 rounder-lg flex justify-between items-center ${
            errors.transactionType
              ? 'border border-red-600 dark:border-red-400'
              : ''
          }`}
        >
          <div className="flex items-center">
            <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">
              category
            </span>
            <span className="form-label text-gray-800 dark:text-gray-200">
              Transaction Type
            </span>
          </div>
          <span className="form-value text-gray-600 dark:text-gray-300">
            {transactionType || 'Select Type'}
          </span>
        </div>
        {errors.transactionType && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            {errors.transactionType}
          </p>
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
