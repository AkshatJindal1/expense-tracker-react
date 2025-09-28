import React from 'react';

export const FormRow = ({
  icon,
  label,
  value,
  placeholder,
  onClick,
  error,
}) => (
  <div
    onClick={onClick}
    className={`form-row cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center border-2 ${
      error ? 'border-red-600 dark:border-red-400' : 'border-transparent'
    }`}
  >
    <div className="flex items-center">
      <span className="material-symbols-outlined mr-3 text-gray-500 dark:text-gray-400">
        {icon}
      </span>
      <span className="form-label text-gray-800 dark:text-gray-200">
        {label}
      </span>
    </div>
    <span className="form-value text-gray-600 dark:text-gray-300">
      {value || placeholder}
    </span>
  </div>
);
