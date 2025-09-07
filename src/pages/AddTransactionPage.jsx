import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AmountInput } from '../components/forms/AmountInput';
import { DateTimeInputs } from '../components/forms/DatetimeInput';
import { FormRow } from '../components/forms/FormRow';
import { SplitwiseInput } from '../components/forms/SplitwiseInput';

export const AddTransactionPage = ({
  onBack,
  onSave,
  onDelete,
  accounts,
  categories,
  openSelectionSheet,
}) => {
  const location = useLocation();
  const initialData = location.state?.initialData;
  const isEditing = !!initialData;

  const [txType, setTxType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splitAmount, setSplitAmount] = useState('');

  useEffect(() => {
    if (initialData) {
      setTxType(initialData.type || 'Expense');
      setAmount(initialData.amount || '');
      setCategory(initialData.category || '');
      setSource(initialData.source || '');
      setDestination(initialData.destination || '');
      setNotes(initialData.notes || '');
      const d = initialData.date?.toDate
        ? initialData.date.toDate()
        : new Date();
      setDate(d.toLocaleDateString('en-CA')); // yyyy-mm-dd format
      setTime(d.toTimeString().slice(0, 5));
      setIsSplit(initialData.splitAmount > 0);
      setSplitAmount(
        initialData.splitAmount > 0 ? initialData.splitAmount : ''
      );
    } else {
      const now = new Date();
      setTxType('Expense');
      setAmount('');
      setCategory('');
      setSource('');
      setDestination('');
      setNotes('');
      setDate(now.toLocaleDateString('en-CA')); // yyyy-mm-dd format
      setTime(now.toTimeString().slice(0, 5));
      setIsSplit(false);
      setSplitAmount('');
    }
  }, [initialData]);

  const handleTxTypeChange = (newType) => {
    if (newType === txType) return;
    setTxType(newType);
    setCategory('');
    setSource('');
    setDestination('');
    setIsSplit(false);
    setSplitAmount('');
  };

  const handleSave = () => {
    if (!amount || !date || !time) {
      alert('Please fill in Amount, Date, and Time.');
      return;
    }
    if (txType !== 'Income' && !source) {
      alert('Please select a source account.');
      return;
    }
    if (txType !== 'Expense' && !destination) {
      alert('Please select a destination account.');
      return;
    }

    const transactionData = {
      id: initialData?.id,
      type: txType,
      amount: parseFloat(amount),
      category,
      source: txType === 'Income' ? null : source,
      destination: txType === 'Expense' ? null : destination,
      date: new Date(`${date}T${time}`),
      notes,
      splitAmount: isSplit ? parseFloat(splitAmount) || 0 : 0,
    };
    onSave(transactionData);
  };

  const handleCategorySelect = () => {
    const items = categories
      .filter((c) => c.transactionType === txType)
      .map((c) => ({ value: c.name }))
      .sort((a, b) => a.value.localeCompare(b.value));
    openSelectionSheet('Select Category', items, category, setCategory);
  };

  const handleAccountSelect = (setter, currentValue) => {
    const items = accounts
      .map((a) => ({ value: a.name, subtext: a.type }))
      .sort((a, b) => a.value.localeCompare(b.value));
    openSelectionSheet('Select Account', items, currentValue, setter);
  };

  return (
    <div className="page p-4 active text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button onClick={onBack} className="material-symbols-outlined mr-2">
            arrow_back
          </button>
          <h1 className="text-2xl font-medium">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
        </div>
        {isEditing && (
          <button
            onClick={() => onDelete(initialData.id)}
            className="text-red-600 dark:text-red-400 material-symbols-outlined"
          >
            delete
          </button>
        )}
      </div>

      <div className="flex justify-around border-b border-gray-200 dark:border-slate-700 mb-4">
        {['Expense', 'Income', 'Transfer'].map((type) => (
          <button
            key={type}
            onClick={() => handleTxTypeChange(type)}
            className={`tx-type-tab flex-1 pb-2 font-normal transition-colors ${
              txType === type
                ? 'active text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AmountInput value={amount} onChange={setAmount} />

        <FormRow
          icon="category"
          label="Category"
          value={category}
          placeholder="Select Category"
          onClick={handleCategorySelect}
        />

        {txType !== 'Income' && (
          <FormRow
            icon="call_made"
            label="Source"
            value={source}
            placeholder="Select Source"
            onClick={() => handleAccountSelect(setSource, source)}
          />
        )}

        {txType !== 'Expense' && (
          <FormRow
            icon="call_received"
            label="Destination"
            value={destination}
            placeholder="Select Destination"
            onClick={() => handleAccountSelect(setDestination, destination)}
          />
        )}

        <DateTimeInputs
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <div>
          <label className="text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 px-1">
            Notes
          </label>
          <div className="form-row p-0 bg-white dark:bg-slate-800 rounded-lg flex items-center">
            <span className="material-symbols-outlined p-3 text-gray-500 dark:text-gray-400">
              edit_note
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-transparent p-3 outline-none placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Add a note..."
            ></textarea>
          </div>
        </div>
        {txType === 'Expense' && (
          <SplitwiseInput
            isSplit={isSplit}
            onToggle={setIsSplit}
            splitAmount={splitAmount}
            onAmountChange={setSplitAmount}
          />
        )}
      </div>

      <button
        onClick={handleSave}
        className="fab save-fab bg-blue-600 dark:bg-blue-500 text-white"
      >
        <span className="material-symbols-outlined">save</span>
      </button>
    </div>
  );
};
