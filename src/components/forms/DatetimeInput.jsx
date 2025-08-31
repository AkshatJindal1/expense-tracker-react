import React from 'react';

export const DateTimeInputs = ({ date, time, onDateChange, onTimeChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="date-time-input">
      <span className="material-symbols-outlined mr-2">calendar_month</span>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="bg-transparent outline-none w-full"
      />
    </div>
    <div className="date-time-input">
      <span className="material-symbols-outlined mr-2">schedule</span>
      <input
        type="time"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        className="bg-transparent outline-none w-full"
      />
    </div>
  </div>
);

export default DateTimeInputs;