import React, { useMemo } from 'react';
import { ExpenseTransaction } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import { parseCategory } from '../utils/categoryUtils';

interface SpendingTypeMatrixProps {
  transactions: ExpenseTransaction[];
}

type SpendingMatrixData = Record<string, {
    nonDiscretionary: number;
    discretionary: number;
    oneTime: number;
    unclassified: number;
    total: number;
}>;

const SpendingTypeMatrix: React.FC<SpendingTypeMatrixProps> = ({ transactions }) => {
  const spendingTypeSummary = useMemo(() => {
    const matrix: SpendingMatrixData = {};
    const totals = {
        nonDiscretionary: 0,
        discretionary: 0,
        oneTime: 0,
        unclassified: 0,
        total: 0,
    };

    transactions.forEach(tx => {
        if (tx.amount < 0) { // Only expenses
            const { parent } = parseCategory(tx.category || 'Uncategorized');
            const amount = Math.abs(tx.amount);

            if (!matrix[parent]) {
                matrix[parent] = { nonDiscretionary: 0, discretionary: 0, oneTime: 0, unclassified: 0, total: 0 };
            }
            
            matrix[parent].total += amount;
            totals.total += amount;

            switch (tx.spendingType) {
                case 'non-discretionary':
                    matrix[parent].nonDiscretionary += amount;
                    totals.nonDiscretionary += amount;
                    break;
                case 'discretionary':
                    matrix[parent].discretionary += amount;
                    totals.discretionary += amount;
                    break;
                case 'one-time':
                    matrix[parent].oneTime += amount;
                    totals.oneTime += amount;
                    break;
                default:
                    matrix[parent].unclassified += amount;
                    totals.unclassified += amount;
                    break;
            }
        }
    });

    const sortedCategories = Object.keys(matrix).sort((a, b) => matrix[b].total - matrix[a].total);

    return { matrix, sortedCategories, totals };
  }, [transactions]);

  if (spendingTypeSummary.sortedCategories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">No expense data for this month.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto text-xs">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <tr className="border-b-2 border-slate-300">
            <th className="text-left font-semibold p-2">Category</th>
            <th className="text-right font-semibold p-2">Non-Disc.</th>
            <th className="text-right font-semibold p-2">Disc.</th>
            <th className="text-right font-semibold p-2">One-Time</th>
            <th className="text-right font-semibold p-2">Unclass.</th>
            <th className="text-right font-bold p-2 border-l-2 border-slate-300">Total</th>
          </tr>
        </thead>
        <tbody>
          {spendingTypeSummary.sortedCategories.map(category => {
            const data = spendingTypeSummary.matrix[category];
            return (
              <tr key={category} className="border-b border-slate-100 last:border-b-0">
                <td className="py-1.5 px-2 font-medium text-slate-700">{category}</td>
                <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrencyWhole(data.nonDiscretionary)}</td>
                <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrencyWhole(data.discretionary)}</td>
                <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrencyWhole(data.oneTime)}</td>
                <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrencyWhole(data.unclassified)}</td>
                <td className="py-1.5 px-2 text-right font-bold border-l-2 border-slate-200">{formatCurrencyWhole(data.total)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="sticky bottom-0 bg-white/95 backdrop-blur-sm">
           <tr className="border-t-2 border-slate-300 font-bold">
            <td className="py-2 px-2">Total</td>
            <td className="py-2 px-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.nonDiscretionary)}</td>
            <td className="py-2 px-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.discretionary)}</td>
            <td className="py-2 px-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.oneTime)}</td>
            <td className="py-2 px-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.unclassified)}</td>
            <td className="py-2 px-2 text-right border-l-2 border-slate-300">{formatCurrencyWhole(spendingTypeSummary.totals.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SpendingTypeMatrix;