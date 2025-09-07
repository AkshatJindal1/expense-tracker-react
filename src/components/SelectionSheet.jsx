import React from 'react';

export const SelectionSheet = ({ config, onClose }) => {
  if (!config.isOpen) return null;

  const handleItemClick = (value) => {
    config.onSelect(value);
    onClose();
  };

  return (
    <div className="modal-overlay visible z-40" onClick={onClose}>
      <div
        className="bottom-sheet bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-center flex-grow text-gray-800 dark:text-gray-200">
            {config.title}
          </h3>
        </div>
        <div className="grid gap-2 max-h-[50vh] overflow-y-auto">
          {config.items.map((item, index) => {
            // FIX: This logic now correctly handles both strings and objects
            const value =
              typeof item === 'object' && item !== null ? item.value : item;
            const subtext =
              typeof item === 'object' && item !== null ? item.subtext : null;
            const isSelected = config.currentValue === value;

            return (
              <div
                key={value + index}
                onClick={() => handleItemClick(value)}
                className={`selection-card p-4 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'selected bg-blue-100 dark:bg-blue-900/50'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`selection-card-main font-medium ${
                    isSelected
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {value}
                </span>
                {subtext && (
                  <span className="selection-card-sub text-sm text-gray-500 dark:text-gray-400">
                    {subtext}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
