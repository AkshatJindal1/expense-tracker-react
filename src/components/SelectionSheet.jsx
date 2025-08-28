import React, { useState, useEffect } from 'react';

export const SelectionSheet = ({ isOpen, title, items, onClose, onSelect, currentValue }) => {
  if (!isOpen) {
    return null;
  }

  const handleItemClick = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <div className="modal-overlay visible z-50" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-center flex-grow">{title}</h3>
        </div>
        <div className="grid gap-2">
          {items.map((item, index) => {
            const isSelected = item.value === currentValue;
            return (
              <div
                key={index}
                className={`selection-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleItemClick(item.value)}
              >
                <span className="selection-card-main">{item.value}</span>
                {item.subtext && (
                  <span className="selection-card-sub">{item.subtext}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};