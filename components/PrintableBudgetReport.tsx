import React from 'react';
import { Budget } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import { parseCategory } from '../utils/categoryUtils';

interface PrintableBudgetReportProps {
  budget: Budget;
}

const PrintableBudgetReport: React.FC<PrintableBudgetReportProps> = ({ budget }) => {
  const totalBudget = budget.items.reduce((sum, item) => sum + item.amount, 0);

  const groupedItems = (() => {
    const groups: Record<string, { items: typeof budget.items, total: number }> = {};
    for (const item of budget.items) {
      const { parent } = parseCategory(item.category);
      if (!groups[parent]) {
        groups[parent] = { items: [], total: 0 };
      }
      groups[parent].items.push(item);
      groups[parent].total += item.amount;
    }
    for (const parent in groups) {
      groups[parent].items.sort((a, b) => a.category.localeCompare(b.category));
    }
    return groups;
  })();

  const sortedParents = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-8 font-sans text-black bg-white">
      <header className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">Budget Report</h1>
        <p className="text-lg mt-2">{budget.name}</p>
      </header>
      
      <main>
        <div className="flex justify-between items-baseline mb-6">
            <p className="text-sm text-gray-600">Report Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-xl font-bold">
                Total Budget: <span className="ml-2">{formatCurrencyWhole(totalBudget)}</span>
            </p>
        </div>

        <div className="space-y-6">
          {sortedParents.map(parent => {
            const group = groupedItems[parent];
            return (
              <div key={parent} className="break-inside-avoid">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xl font-semibold border-b-2 border-gray-400 pb-2" colSpan={2}>
                        {parent}
                      </th>
                      <th className="text-right text-xl font-semibold border-b-2 border-gray-400 pb-2">
                        {formatCurrencyWhole(group.total)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => {
                      const { child } = parseCategory(item.category);
                      const displayName = child || item.category;
                      return (
                        <tr key={item.category} className="border-b border-gray-200">
                          <td className="py-2 pl-4 text-gray-700" colSpan={2}>{displayName}</td>
                          <td className="py-2 text-right font-medium">{formatCurrencyWhole(item.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
        <p>Net Worth Tracker</p>
      </footer>
    </div>
  );
};

export default PrintableBudgetReport;