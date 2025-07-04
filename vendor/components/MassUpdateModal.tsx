import React, { useState, useEffect } from 'react';
import { ExpenseTransaction } from '../types';
import Modal from './Modal';
import { formatCurrencyWhole } from '../utils/formatters';

interface MassUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionIds: string[], newCategory: string) => void;
  data: {
    originalTx: ExpenseTransaction;
    similarTxs: ExpenseTransaction[];
    newCategory: string;
  } | null;
}

const MassUpdateModal: React.FC<MassUpdateModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allTransactions = data ? [data.originalTx, ...data.similarTxs] : [];

  useEffect(() => {
    if (data) {
      // Pre-select all transactions by default when modal opens
      const allIds = allTransactions.map(tx => tx.id);
      setSelectedIds(new Set(allIds));
    }
  }, [data]);

  if (!isOpen || !data) {
    return null;
  }

  const handleToggle = (id: string) => {
    // Don't allow deselecting the original transaction that triggered the update
    if (id === data.originalTx.id) return; 
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = allTransactions.map(tx => tx.id);
    setSelectedIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    // Deselect all except for the original transaction which must be updated
    setSelectedIds(new Set([data.originalTx.id]));
  };
  
  const handleSubmit = () => {
    onConfirm(Array.from(selectedIds), data.newCategory);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Similar Transactions">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          You reclassified an expense for <strong className="text-slate-800">"{data.originalTx.description}"</strong> from <strong className="text-red-600">{data.originalTx.category}</strong> to <strong className="text-green-600">{data.newCategory}</strong>.
        </p>
        <p className="text-sm text-slate-600">
          We found {data.similarTxs.length} other transaction(s) with a similar description in the old category. Do you want to apply this change to them as well?
        </p>
        
        <div className="border border-slate-200 rounded-md">
            <div className="flex justify-end space-x-2 p-2 bg-slate-50 border-b">
                <button type="button" onClick={handleSelectAll} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Select All</button>
                <button type="button" onClick={handleDeselectAll} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Deselect All</button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {allTransactions.map(tx => (
                    <label key={tx.id} className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={selectedIds.has(tx.id)}
                            onChange={() => handleToggle(tx.id)}
                            disabled={tx.id === data.originalTx.id}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-75"
                        />
                        <div className="flex-grow flex justify-between text-sm">
                            <span className="text-slate-500">{tx.transactionDate}</span>
                            <span className="font-medium text-slate-800">{formatCurrencyWhole(tx.amount)}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm disabled:bg-primary/50"
            >
              Update {selectedIds.size} Transaction(s)
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default MassUpdateModal;