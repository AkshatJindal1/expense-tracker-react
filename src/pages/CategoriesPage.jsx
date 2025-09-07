import React, { useState, useMemo } from 'react';
import { CategoryCard } from '../components/CategoryCard';

export const CategoriesPage = ({
  categories,
  onBack,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const groupedCategories = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const { transactionType } = cat;
      if (!acc[transactionType]) acc[transactionType] = [];
      acc[transactionType].push(cat);
      return acc;
    }, {});
  }, [categories]);

  // ... (selection logic similar to AccountsPage) ...
  const handleCardClick = (category) => {
    if (isSelecting) {
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(category.id)) {
        newSelectedIds.delete(category.id);
      } else {
        newSelectedIds.add(category.id);
      }
      setSelectedIds(newSelectedIds);
    } else {
      onEdit(category);
    }
  };

  const toggleSelectionMode = () => {
    if (isSelecting) {
      setSelectedIds(new Set());
    }
    setIsSelecting(!isSelecting);
  };

  const handleDeleteSelected = () => {
    onDelete(Array.from(selectedIds));
    toggleSelectionMode();
  };

  return (
    <div className="page active bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm pt-4 px-4 pb-4">
        <div className="flex items-center justify-between mb-4 text-gray-800 dark:text-gray-200">
          {isSelecting ? (
            <>
              <button
                onClick={toggleSelectionMode}
                className="material-symbols-outlined"
              >
                close
              </button>
              <span className="font-medium">{selectedIds.size} selected</span>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="material-symbols-outlined text-red-600 disabled:text-gray-400 dark:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-600"
              >
                delete
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <button
                  onClick={onBack}
                  className="material-symbols-outlined mr-2"
                >
                  arrow_back
                </button>
                <h1 className="text-2xl font-medium">Categories</h1>
              </div>
              <button
                onClick={toggleSelectionMode}
                className="p-2 material-symbols-outlined"
              >
                select
              </button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-4 px-4">
        {Object.entries(groupedCategories).map(([type, cats]) => (
          <div key={type}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-2">
              {type}
            </h3>
            <div className="space-y-3">
              {cats.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  isSelecting={isSelecting}
                  isSelected={selectedIds.has(cat.id)}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!isSelecting && (
        <button
          onClick={onAddNew}
          className="fab page-fab bg-blue-600 dark:bg-blue-500 text-white"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
  );
};
