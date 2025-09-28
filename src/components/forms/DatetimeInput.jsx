import React from 'react';

export const DateTimeInputs = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div
      className={`date-time-input bg-white dark:bg-slate-800 border-2 ${
        dateError ? 'border-red-600 dark:border-red-400' : 'border-transparent'
      }`}
    >
      <span className="material-symbols-outlined mr-2 text-gray-500 dark:text-gray-400">
        calendar_month
      </span>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="bg-transparent outline-none w-full text-gray-800 dark:text-gray-200"
        style={{ colorScheme: 'dark' }} // Ensures date picker controls are visible in dark mode
      />
    </div>
    <div
      className={`date-time-input bg-white dark:bg-slate-800 border-2 ${
        timeError ? 'border-red-600 dark:border-red-400' : 'border-transparent'
      }`}
    >
      <span className="material-symbols-outlined mr-2 text-gray-500 dark:text-gray-400">
        schedule
      </span>
      <input
        type="time"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        className="bg-transparent outline-none w-full text-gray-800 dark:text-gray-200"
        style={{ colorScheme: 'dark' }} // Ensures time picker controls are visible in dark mode
      />
    </div>
  </div>
);
