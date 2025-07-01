
import React from 'react';
import { StockHolding } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';

interface StockHoldingRowProps {
  holding: StockHolding;
}

const StockHoldingRow: React.FC<StockHoldingRowProps> = ({ holding }) => {
  const currentValue = holding.shares * holding.currentPrice;
  const purchaseValue = holding.shares * holding.purchasePrice;
  const gainLoss = currentValue - purchaseValue;
  const gainLossPercent = purchaseValue !== 0 ? (gainLoss / purchaseValue) * 100 : 0;

  const gainLossColor = gainLoss > 0 ? 'text-green-600' : gainLoss < 0 ? 'text-red-600' : 'text-slate-600';

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 text-sm even:bg-sky-100">
      <div className="font-medium text-slate-700 col-span-1 sm:col-span-1">{holding.symbol}</div>
      <div className="text-slate-600 text-right sm:text-left col-span-1 sm:col-span-1">{holding.shares}</div>
      <div className="text-slate-600 text-right sm:text-left col-span-1 sm:col-span-1">{formatCurrencyWhole(holding.currentPrice)}</div>
      <div className="text-slate-700 font-semibold text-right sm:text-left col-span-1 sm:col-span-1">{formatCurrencyWhole(currentValue)}</div>
      <div className={`text-right sm:text-left col-span-2 sm:col-span-2 ${gainLossColor}`}>
        {formatCurrencyWhole(gainLoss)} ({gainLossPercent.toFixed(2)}%)
      </div>
    </div>
  );
};

export default StockHoldingRow;