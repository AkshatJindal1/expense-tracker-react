import React from 'react';

export const CategoryCard = ({
  category,
  isSelecting,
  isSelected,
  onClick,
}) => {
  const bgColor = isSelected
    ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 border'
    : 'bg-white dark:bg-slate-800';
  return (
    <div
      onClick={() => onClick(category)}
      className={`category-card p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${bgColor}`}
    >
      {isSelecting && (
        <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600 dark:text-blue-400">
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      )}
      <div className="flex-grow text-gray-800 dark:text-gray-200">
        <p className="font-normal">{category.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {category.transactionType}
        </p>
      </div>
    </div>
  );
};
