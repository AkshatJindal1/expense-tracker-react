// src/components/ButtonSpinner.jsx
import React from 'react';

export const ButtonSpinner = () => (
  <svg className="button-spinner" viewBox="0 0 50 50">
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
);
