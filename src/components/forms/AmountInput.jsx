import React from 'react';

const AmountInput = ({ value, onChange }) => (
  <div className="floating-label-container">
    <span className="icon-prefix font-medium text-lg">₹</span>
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="floating-input"
      placeholder=" " // The space is important for the CSS selector to work
      required
    />
    <label htmlFor="tx-amount" className="floating-label">Amount</label>
  </div>
);

export default AmountInput;