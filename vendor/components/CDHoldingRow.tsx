import React from 'react';
import { CDHolding } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';

interface CDHoldingRowProps {
  holding: CDHolding;
}

const CDHoldingRow: React.FC<CDHoldingRowProps> = ({ holding }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-2 border-b border-slate-200 text-sm">
      <div className="font-medium text-slate-700 col-span-1">{formatCurrencyWhole(holding.principal)}</div>
      <div className="text-slate-600 col-span-1">{holding.interestRate.toFixed(2)}%</div>
      <div className="text-slate-600 col-span-1 sm:col-span-2">{holding.maturityDate}</div>
    </div>
  );
};

export default CDHoldingRow;