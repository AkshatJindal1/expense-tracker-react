import React from 'react';

const CategoryCard = ({ category, isSelecting, isSelected, onClick }) => (
  <div
    onClick={() => onClick(category)}
    className={`bg-white p-3 rounded-lg shadow-sm flex items-center transition-all ${isSelecting ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-100 border-blue-500 border' : ''}`}>
    {isSelecting && (
       <span className="selection-indicator material-symbols-outlined mr-3 text-blue-600">
        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
      </span>
    )}
    <div className="flex-grow">
      <p className="font-normal">{category.name}</p>
      <p className="text-xs text-gray-500">{category.transactionType}</p>
    </div>
  </div>
);

export default CategoryCard;