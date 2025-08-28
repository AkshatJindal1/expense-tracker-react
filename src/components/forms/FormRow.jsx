import React, { useState, useEffect } from 'react';

export const FormRow = ({ icon, label, value, placeholder, onClick }) => (
  <div onClick={onClick} className="form-row cursor-pointer">
    <span className="material-symbols-outlined">{icon}</span>
    <span className="form-label">{label}</span>
    <span className="form-value">{value || placeholder}</span>
  </div>
);

export default FormRow;