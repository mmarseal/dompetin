import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Delete,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORIES } from '../constants/categories';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRANSACTION_TYPES = [
  { id: 'expense', label: 'Expense', icon: TrendingDown },
  { id: 'income',  label: 'Income',  icon: TrendingUp  },
];

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'DEL'],
];

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Formats a raw digit string into a localised display number.
 * e.g. "75000" → "75.000"  |  "75000.5" → "75.000,5"
 */
const formatDisplayAmount = (raw) => {
  if (!raw || raw === '0') return '0';
  const [intPart, decPart] = raw.split('.');
  const formatted = new Intl.NumberFormat('id-ID').format(
    parseInt(intPart || '0', 10)
  );
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Header = ({ onBack }) => (
  <div className="flex items-center gap-3 px-4 pt-5 pb-4">
    <button
      id="add-transaction-back"
      onClick={onBack}
      aria-label="Go back"
      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                 hover:bg-gray-200 active:scale-95 transition-all"
    >
      <ChevronLeft className="w-5 h-5 text-gray-600" />
    </button>
    <h1 className="text-base font-bold text-gray-800">Add Transaction</h1>
  </div>
);

const TypeToggle = ({ activeType, onSelect }) => (
  <div className="mx-4 flex bg-gray-100 rounded-xl p-1 gap-1">
    {TRANSACTION_TYPES.map(({ id, label, icon: Icon }) => {
      const isActive = activeType === id;
      const activeStyle =
        id === 'expense'
          ? 'bg-red-500 text-white shadow-sm'
          : 'bg-[#189C63] text-white shadow-sm';
      return (
        <button
          key={id}
          id={`type-toggle-${id}`}
          onClick={() => onSelect(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg
                      text-sm font-semibold transition-all duration-200
                      ${isActive ? activeStyle : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2.5} />
          {label}
        </button>
      );
    })}
  </div>
);

const AmountDisplay = ({ rawAmount, type }) => {
  const isEmpty = !rawAmount || rawAmount === '0';
  const accentColor = type === 'expense' ? 'text-red-500' : 'text-[#189C63]';
  return (
    <div className="mx-4 mt-4 px-5 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
        Amount
      </p>
      <div className={`flex items-baseline justify-center gap-1 ${isEmpty ? 'text-gray-300' : accentColor}`}>
        <span className="text-xl font-bold">Rp</span>
        <span className="text-4xl font-extrabold tracking-tight leading-none min-h-[48px]">
          {isEmpty ? '0' : formatDisplayAmount(rawAmount)}
        </span>
      </div>
      <div className="flex justify-center mt-2">
        <div className={`w-0.5 h-5 rounded-full animate-pulse ${isEmpty ? 'bg-gray-200' : accentColor}`} />
      </div>
    </div>
  );
};

const CategorySelector = ({ selectedId, onSelect }) => (
  <div className="mt-4 px-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
      Category
    </p>
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ id, label, icon: Icon, color, activeColor }) => {
        const isActive = selectedId === id;
        return (
          <button
            key={id}
            id={`category-${id}`}
            onClick={() => onSelect(id)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
                          ${isActive
                            ? `${activeColor} shadow-md scale-105 ring-2 ring-offset-1 ring-current`
                            : `${color} hover:scale-105`
                          }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'text-white' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span
              className={`text-[10px] font-medium leading-tight max-w-[56px] text-center
                          ${isActive ? 'text-gray-800' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const NoteInput = ({ value, onChange }) => (
  <div className="mx-4 mt-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      Notes
    </p>
    <input
      id="transaction-note"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add a note (optional)…"
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3
                 text-sm text-gray-700 placeholder-gray-300 font-medium
                 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                 transition-all"
    />
  </div>
);

const KeypadButton = ({ value, onPress }) => {
  const isSpecial = value === 'DEL' || value === '.';
  return (
    <button
      id={`keypad-${value}`}
      onClick={() => onPress(value)}
      aria-label={value === 'DEL' ? 'Backspace' : value}
      className={`flex items-center justify-center rounded-2xl h-14
                  text-xl font-bold transition-all active:scale-95 select-none
                  ${isSpecial
                    ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    : 'bg-white text-gray-800 shadow-sm hover:bg-gray-50 border border-gray-100'
                  }`}
    >
      {value === 'DEL' ? (
        <Delete className="w-5 h-5" strokeWidth={2} />
      ) : (
        value
      )}
    </button>
  );
};

const Keypad = ({ onPress, onConfirm, canConfirm }) => (
  <div className="px-4 mt-4 pb-2">
    <div className="grid grid-cols-3 gap-2.5 mb-3">
      {KEYPAD_ROWS.flat().map((key) => (
        <KeypadButton key={key} value={key} onPress={onPress} />
      ))}
    </div>
    <button
      id="keypad-confirm"
      onClick={onConfirm}
      disabled={!canConfirm}
      aria-label="Save transaction"
      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                  text-white font-bold text-base transition-all active:scale-[0.98]
                  ${canConfirm
                    ? 'bg-[#189C63] shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
    >
      <Check className="w-5 h-5" strokeWidth={2.5} />
      Save Transaction
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * AddTransaction
 *
 * Manages local form state (type, amount, category, note).
 * On confirm: builds a transaction object and dispatches it to
 * TransactionContext, then navigates back to Home.
 */
const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();

  const [type, setType] = useState('expense');
  const [rawAmount, setRawAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [note, setNote] = useState('');

  // ── Keypad handler ───────────────────────────────────────────────────────

  const handleKeyPress = (key) => {
    if (key === 'DEL') {
      setRawAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && rawAmount.includes('.')) return;
    const [intPart = ''] = rawAmount.split('.');
    if (!rawAmount.includes('.') && intPart.length >= 12) return;
    if (rawAmount === '0' && key !== '.') {
      setRawAmount(key);
      return;
    }
    setRawAmount((prev) => prev + key);
  };

  // ── Confirm handler ──────────────────────────────────────────────────────

  const numericAmount = parseFloat(rawAmount) || 0;
  const selectedCategory = CATEGORIES.find((c) => c.id === selectedCategoryId);
  const canConfirm = numericAmount > 0 && Boolean(selectedCategory);

  const handleConfirm = () => {
    if (!canConfirm) return;

    addTransaction({
      id: Date.now().toString(),
      type,
      amount: numericAmount,
      category: selectedCategory.label,
      note: note.trim(),
      date: new Date().toISOString(),
    });

    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-24">
      <Header onBack={() => navigate(-1)} />
      <TypeToggle activeType={type} onSelect={setType} />
      <AmountDisplay rawAmount={rawAmount} type={type} />
      <CategorySelector selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
      <NoteInput value={note} onChange={setNote} />
      <Keypad onPress={handleKeyPress} onConfirm={handleConfirm} canConfirm={canConfirm} />
    </div>
  );
};

export default AddTransaction;
