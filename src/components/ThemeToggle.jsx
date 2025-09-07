import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

export const themeOptions = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'brightness_auto' },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 px-1">
        Appearance
      </label>
      <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              theme === option.value
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="material-symbols-outlined !text-base">
              {option.icon}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
