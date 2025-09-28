import React, { useEffect } from 'react';

export const ErrorSnackbar = ({ message, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <div
      id="error-snackbar"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white dark:bg-red-500 dark:text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ${
        message ? 'visible' : ''
      }`}
    >
      {message}
    </div>
  );
};
