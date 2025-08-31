import React, { useState } from 'react';

const AddCategoryPage = ({ onSave, onBack, onDelete, initialData, openSelectionSheet, showConfirmation }) => {
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
    
    // FIX: Replaced window.confirm with the new confirmation modal
    const handleDelete = () => {
        onDelete(initialData.id)
    };

    return (
        <div className="page p-4 active">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center">
                    <button onClick={onBack} className="material-symbols-outlined mr-2">arrow_back</button>
                    <h1 className="text-2xl font-medium text-gray-800">{isEditing ? 'Edit Category' : 'Add Category'}</h1>
                </div>
                {isEditing && (
                    <button onClick={handleDelete} className="text-red-600 material-symbols-outlined">delete</button>
                )}
            </div>
             <div className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="w-full bg-gray-100 p-3 rounded-lg"/>
                <div onClick={() => openSelectionSheet('Select Transaction Type', ['Expense', 'Income', 'Transfer'], transactionType, setTransactionType)} className="form-row cursor-pointer">
                    <span className="material-symbols-outlined">category</span>
                    <span className="form-label">Transaction Type</span>
                    <span className="form-value">{transactionType || 'Select Type'}</span>
                </div>
            </div>
            <button onClick={handleSave} className="fab save-fab">
                <span className="material-symbols-outlined">save</span>
            </button>
        </div>
    );
};

export default AddCategoryPage;