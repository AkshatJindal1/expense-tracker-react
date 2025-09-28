import React from 'react';

export const Spinner = () => (
  <div className="spinner-overlay">
    <svg className="m3-spinner" viewBox="0 0 50 50">
      <circle
        className="path"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        cx="25"
        cy="25"
        r="20"
      ></circle>
    </svg>
  </div>
);
