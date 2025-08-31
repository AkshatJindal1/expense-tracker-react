import React from 'react';

export const SelectionSheet = ({ config, onClose }) => {
  if (!config.isOpen) return null;

  const handleItemClick = (value) => {
    config.onSelect(value);
    onClose();
  };

  return (
    <div className="modal-overlay visible z-40" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-center flex-grow">{config.title}</h3>
        </div>
        <div className="grid gap-2 max-h-[50vh] overflow-y-auto">
          {config.items.map((item, index) => {
            // FIX: This logic now correctly handles both strings and objects
            const value = typeof item === 'object' && item !== null ? item.value : item;
            const subtext = typeof item === 'object' && item !== null ? item.subtext : null;
            const isSelected = config.currentValue === value;

            return (
              <div
                key={value + index}
                onClick={() => handleItemClick(value)}
                className={`selection-card ${isSelected ? 'selected' : ''}`}
              >
                <span className="selection-card-main">{value}</span>
                {subtext && <span className="selection-card-sub">{subtext}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};