import React, { useEffect, useMemo } from 'react';
import { Budget, ExpenseTransaction, SpendingType } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import { parseCategory } from '../utils/categoryUtils';

interface PrintableExpenseReportProps {
  month: string;
  transactions: ExpenseTransaction[];
  budget: Budget | null;
  onReady: () => void;
}

type SpendingMatrix = Record<string, {
    nonDiscretionary: number;
    discretionary: number;
    oneTime: number;
    unclassified: number;
    total: number;
}>;


const PrintableExpenseReport: React.FC<PrintableExpenseReportProps> = ({ month, transactions, budget, onReady }) => {
  useEffect(() => {
    onReady();
  }, [onReady]);

  const formatMonthDisplay = (monthKey: string) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const budgetComparisonData = useMemo(() => {
    if (!budget) return null;

    const actuals: Record<string, number> = {};

    transactions.forEach(tx => {
      // Find which budget item this transaction applies to
      const { parent, child } = parseCategory(tx.category);
      const subCategory = child ? `${parent}:${child}` : parent;
      
      const budgetItem = budget.items.find(item => item.category === subCategory || item.category === parent);
      
      if (budgetItem && tx.amount < 0) {
        actuals[budgetItem.category] = (actuals[budgetItem.category] || 0) + Math.abs(tx.amount);
      }
    });
    
    const rows = budget.items.map(item => {
      const actual = actuals[item.category] || 0;
      return {
        category: item.category,
        budgeted: item.amount,
        actual,
        difference: item.amount - actual,
      };
    }).sort((a,b) => b.budgeted - a.budgeted);

    const totals = {
      budgeted: rows.reduce((sum, r) => sum + r.budgeted, 0),
      actual: rows.reduce((sum, r) => sum + r.actual, 0),
      difference: rows.reduce((sum, r) => sum + r.difference, 0),
    };

    return { rows, totals };
  }, [budget, transactions]);

  const actualsData = useMemo(() => {
    // This is used only when no budget is selected.
    if (budget) return null;

    const categories: Record<string, number> = {};
    transactions.forEach(tx => {
        if (tx.amount < 0) { // only expenses
            const category = tx.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + Math.abs(tx.amount);
        }
    });
    
    const rows = Object.entries(categories).map(([category, actual]) => ({
        category,
        actual
    })).sort((a,b) => b.actual - a.actual);
    
    const total = rows.reduce((sum, r) => sum + r.actual, 0);
    
    return { rows, total };
  }, [transactions, budget]);
  
  const spendingTypeSummary = useMemo(() => {
    const matrix: SpendingMatrix = {};
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


  return (
    <div className="p-8 font-sans text-black bg-white printable-report-container">
      <header className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">Expense Report</h1>
        <p className="text-lg mt-2">{formatMonthDisplay(month)}</p>
      </header>
      
      <main className="space-y-8">
        <div className="break-inside-avoid">
          <h2 className="text-2xl font-semibold mb-3">Expenses by Spending Type</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left font-semibold pb-2">Category</th>
                <th className="text-right font-semibold pb-2">Non-Discretionary</th>
                <th className="text-right font-semibold pb-2">Discretionary</th>
                <th className="text-right font-semibold pb-2">One-Time</th>
                <th className="text-right font-semibold pb-2">Unclassified</th>
                <th className="text-right font-semibold pb-2 border-l-2 border-gray-400">Category Total</th>
              </tr>
            </thead>
            <tbody>
              {spendingTypeSummary.sortedCategories.map(category => {
                const data = spendingTypeSummary.matrix[category];
                return (
                  <tr key={category} className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-800">{category}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrencyWhole(data.nonDiscretionary)}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrencyWhole(data.discretionary)}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrencyWhole(data.oneTime)}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrencyWhole(data.unclassified)}</td>
                    <td className="py-2 text-right font-bold border-l-2 border-gray-300">{formatCurrencyWhole(data.total)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black font-bold text-base">
                <td className="py-2">Grand Total</td>
                <td className="py-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.nonDiscretionary)}</td>
                <td className="py-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.discretionary)}</td>
                <td className="py-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.oneTime)}</td>
                <td className="py-2 text-right">{formatCurrencyWhole(spendingTypeSummary.totals.unclassified)}</td>
                <td className="py-2 text-right border-l-2 border-gray-400">{formatCurrencyWhole(spendingTypeSummary.totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {budgetComparisonData ? (
          <div className="break-inside-avoid">
            <h2 className="text-2xl font-semibold mb-3">Actual vs. Budgeted Expenses</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left font-semibold pb-2">Category</th>
                  <th className="text-right font-semibold pb-2">Budgeted</th>
                  <th className="text-right font-semibold pb-2">Actual</th>
                  <th className="text-right font-semibold pb-2">Difference</th>
                </tr>
              </thead>
              <tbody>
                {budgetComparisonData.rows.map(row => (
                  <tr key={row.category} className="border-b border-gray-200">
                    <td className="py-2 text-gray-700">{row.category}</td>
                    <td className="py-2 text-right">{formatCurrencyWhole(row.budgeted)}</td>
                    <td className="py-2 text-right">{formatCurrencyWhole(row.actual)}</td>
                    <td className={`py-2 text-right font-medium ${row.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrencyWhole(row.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right">{formatCurrencyWhole(budgetComparisonData.totals.budgeted)}</td>
                  <td className="py-2 text-right">{formatCurrencyWhole(budgetComparisonData.totals.actual)}</td>
                  <td className={`py-2 text-right ${budgetComparisonData.totals.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrencyWhole(budgetComparisonData.totals.difference)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (actualsData && (
          <div className="break-inside-avoid">
            <h2 className="text-2xl font-semibold mb-3">Actual Expenses</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left font-semibold pb-2">Category</th>
                  <th className="text-right font-semibold pb-2">Actual</th>
                </tr>
              </thead>
              <tbody>
                {actualsData.rows.map(row => (
                  <tr key={row.category} className="border-b border-gray-200">
                    <td className="py-2 text-gray-700">{row.category}</td>
                    <td className="py-2 text-right font-medium">{formatCurrencyWhole(row.actual)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right">{formatCurrencyWhole(actualsData.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </main>

      <footer className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
        <p>Net Worth Tracker &bull; Report Generated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default PrintableExpenseReport;