import React, { useState, useRef, useEffect } from 'react';
import { formatCurrencyWhole } from '../utils/formatters';

interface EditableBudgetValueProps {
  value: number;
  onSave: (newValue: number) => void;
  className?: string;
}

const EditableBudgetValue: React.FC<EditableBudgetValueProps> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newAmount = parseFloat(currentValue);
    if (!isNaN(newAmount) && newAmount >= 0 && newAmount !== value) {
      onSave(newAmount);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value.toString());
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    // Timeout to allow for click on save button if one existed
    setTimeout(handleSave, 100);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} w-24 text-right p-1 -m-1 border border-primary rounded-md focus:ring-1 focus:ring-primary bg-white`}
        step="0.01"
        min="0"
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className={`${className} p-1 -m-1 cursor-pointer rounded-md hover:bg-slate-200/50`}>
      {formatCurrencyWhole(value)}
    </span>
  );
};

export default EditableBudgetValue;