import React, { useState, useEffect } from 'react';
import AmountInput from '../components/forms/amountInput';
import DateTimeInputs from '../components/forms/datetimeInput';
import FormRow from '../components/forms/formRow';
import SplitwiseInput from '../components/forms/SplitwiseInput';

export const AddTransactionPage = ({ onBack, onSave, accounts, categories, openSelectionSheet }) => {
    const [txType, setTxType] = useState('Expense');

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSplit, setIsSplit] = useState(false);
    const [splitAmount, setSplitAmount] = useState('');

    // Set initial date and time on component mount
    useEffect(() => {
        const now = new Date();
        const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        setDate(localDate.toISOString().slice(0, 10));
        setTime(localDate.toISOString().slice(11, 16));
    }, []);

    // Reset dependent fields when transaction type changes
    useEffect(() => {
        setCategory('');
        setSource('');
        setDestination('');
        setIsSplit(false);
        setSplitAmount('');
    }, [txType]);

    const handleSave = () => {
        // Basic validation
        if (!amount || !category || !date || !time) {
            alert("Please fill in all required fields.");
            return;
        }
        if (txType !== 'Income' && !source) {
            alert("Please select a source account.");
            return;
        }
        if (txType !== 'Expense' && !destination) {
            alert("Please select a destination account.");
            return;
        }

        const transactionData = {
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
            .filter(c => c.transactionType === txType)
            .map(c => ({ value: c.name }))
            .sort((a, b) => a.value.localeCompare(b.value));

        openSelectionSheet('Select Category', items, category, (value) => setCategory(value));
    };

    const handleAccountSelect = (setter, currentValue) => {
        const items = accounts
            .map(a => ({ value: a.name, subtext: a.type }))
            .sort((a, b) => a.value.localeCompare(b.value));

        openSelectionSheet(`Select ${txType === 'Expense' ? 'Source' : 'Destination'}`, items, currentValue, (value) => setter(value));
    }

    return (
        <div className="page p-4 active">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="material-symbols-outlined mr-2">
                        arrow_back
                    </button>
                    <h1 className="text-2xl font-medium text-gray-800">
                        Add Transaction
                    </h1>
                </div>
                {/* Delete button can be added here for edit mode */}
            </div>

            {/* Transaction Type Tabs */}
            <div className="flex justify-around border-b mb-4">
                {['Expense', 'Income', 'Transfer'].map(type => (
                    <button
                        key={type}
                        onClick={() => setTxType(type)}
                        className={`tx-type-tab flex-1 pb-2 font-normal ${txType === type ? 'active' : ''}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Form */}
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
                    <label className="text-sm font-normal text-gray-700 mb-1">Notes</label>
                    <div className="form-row p-0">
                        <span className="material-symbols-outlined p-3">edit_note</span>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-transparent p-3 outline-none"
                            placeholder="Add a note..."
                        ></textarea>
                    </div>
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

            {/* Save Button */}
            <button onClick={handleSave} className="fab save-fab">
                <span className="material-symbols-outlined">save</span>
            </button>
        </div>
    );
};

export default AddTransactionPage;