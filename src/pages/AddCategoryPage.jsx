import React, { useState } from 'react';

export const AddCategoryPage = ({ onSave, onBack, onDelete, initialData, openSelectionSheet, showConfirmation }) => {
    const isEditing = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [transactionType, setTransactionType] = useState(initialData?.transactionType || '');

    const handleSave = () => {
        if (!name || !transactionType) {
            console.error("Please fill all fields.");
            return;
        }
        onSave({ id: initialData?.id, name, transactionType });
    };

    const handleDelete = () => {
        onDelete(initialData.id)
    };

    return (
        <div className="page p-4 active text-gray-800 dark:text-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="material-symbols-outlined mr-2">arrow_back</button>
                    <h1 className="text-2xl font-medium">{isEditing ? 'Edit Category' : 'Add Category'}</h1>
                </div>
                {isEditing && (
                    <button onClick={handleDelete} className="text-red-600 dark:text-red-400 material-symbols-outlined">delete</button>
                )}
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Category Name"
                    className="w-full bg-gray-100 dark:bg-slate-700 p-3 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 border border-transparent focus:border-blue-500 focus:ring-0 outline-none" />
                <div
                    onClick={() => openSelectionSheet('Select Transaction Type', ['Expense', 'Income', 'Transfer'], transactionType, setTransactionType)}
                    className="form-row cursor-pointer bg-white dark:bg-slate-800 p-3 rounder-lg flex justify-between items-center"
                >
                    <div className="flex items-center">
                        <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">category</span>
                        <span className="form-label text-gray-800 dark:text-gray-200">Transaction Type</span>
                    </div>
                    <span className="form-value text-gray-600 dark:text-gray-300">{transactionType || 'Select Type'}</span>
                </div>
            </div>
            <button onClick={handleSave} className="fab save-fab bg-blue-600 dark:bg-blue-500 text-white">
                <span className="material-symbols-outlined">save</span>
            </button>
        </div>
    );
};