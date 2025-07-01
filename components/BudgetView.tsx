
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Budget, ExpenseTransaction, CategoryHierarchy } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import Modal from './Modal';
import EditableBudgetValue from './EditableBudgetValue';
import { parseCategory } from '../utils/categoryUtils';

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.135.74.34 1.056.602a.75.75 0 0 1-1.228.878A2.25 2.25 0 0 0 13.25 7h-6.5a2.25 2.25 0 0 0-1.581.682.75.75 0 0 1-1.228-.878A3.734 3.734 0 0 1 5 6.302V2.75Zm3.559 8.24a.75.75 0 0 1 1.06 0l1.5 1.5a.75.75 0 0 1-1.06 1.06l-.97-.97v3.172a.75.75 0 0 1-1.5 0V12.58l-.97.97a.75.75 0 0 1-1.06-1.06l1.5-1.5ZM5.5 10a.75.75 0 0 0-1.5 0v3.25A2.75 2.75 0 0 0 6.75 16h6.5A2.75 2.75 0 0 0 16 13.25V10a.75.75 0 0 0-1.5 0v3.25c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25V10Z" clipRule="evenodd" />
    </svg>
);

interface BudgetViewProps {
  transactions: ExpenseTransaction[];
  budgets: Budget[];
  onAddBudget: (name: string, selectedMonths: string[], selectedCategories: string[]) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateBudgetItem: (budgetId: string, category: string, newAmount: number) => void;
  categoryStructure: CategoryHierarchy;
  onPrintBudget: (id: string) => void;
}


const BudgetView: React.FC<BudgetViewProps> = ({ transactions, budgets, onAddBudget, onDeleteBudget, onUpdateBudgetItem, categoryStructure, onPrintBudget }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach(tx => {
      const date = new Date(tx.transactionDate);
      if (!isNaN(date.getTime())) {
        monthSet.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);
  
  const groupedMonthsByYear = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const month of availableMonths) {
      const year = month.split('-')[0];
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(month);
    }
    return groups;
  }, [availableMonths]);

  // Set initial selections when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSelectedMonths(new Set(availableMonths));

      const initialSelectedCategories = new Set<string>();
      Object.entries(categoryStructure).forEach(([parent, children]) => {
          if (children && children.length > 0) {
              children.forEach(child => {
                  initialSelectedCategories.add(`${parent}:${child}`);
              });
          } else {
              initialSelectedCategories.add(parent);
          }
      });
      setSelectedCategories(initialSelectedCategories);
    }
  }, [isModalOpen, availableMonths, categoryStructure]);

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(month)) newSet.delete(month);
      else newSet.add(month);
      return newSet;
    });
  };

  const handleYearToggle = (monthsInYear: string[], allCurrentlySelected: boolean) => {
    setSelectedMonths(prev => {
      const newSet = new Set(prev);
      if (allCurrentlySelected) {
        monthsInYear.forEach(m => newSet.delete(m));
      } else {
        monthsInYear.forEach(m => newSet.add(m));
      }
      return newSet;
    });
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const handleSelectAllMonths = () => setSelectedMonths(new Set(availableMonths));
  const handleDeselectAllMonths = () => setSelectedMonths(new Set());
  
  const handleSelectAllCategories = () => {
    const allCats = Object.entries(categoryStructure).flatMap(([parent, children]) =>
        [parent, ...children.map(child => `${parent}:${child}`)]
    );
    setSelectedCategories(new Set(allCats));
  };
  const handleDeselectAllCategories = () => setSelectedCategories(new Set());

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBudget(newBudgetName, Array.from(selectedMonths), Array.from(selectedCategories));
    setIsModalOpen(false);
    setNewBudgetName('');
  };

  const formatMonthDisplay = (monthKey: string) => {
      const [year, month] = monthKey.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const YearCheckboxGroup: React.FC<{
      year: string;
      monthsInYear: string[];
      selectedMonths: Set<string>;
    }> = ({ year, monthsInYear, selectedMonths }) => {
        const yearCheckboxRef = useRef<HTMLInputElement>(null);

        const allSelected = useMemo(() => monthsInYear.every(m => selectedMonths.has(m)), [monthsInYear, selectedMonths]);
        const someSelected = useMemo(() => monthsInYear.some(m => selectedMonths.has(m)), [monthsInYear, selectedMonths]);

        useEffect(() => {
            if (yearCheckboxRef.current) {
                yearCheckboxRef.current.indeterminate = someSelected && !allSelected;
            }
        }, [someSelected, allSelected]);

        return (
            <div key={year}>
                <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-100 font-semibold">
                    <input
                        ref={yearCheckboxRef}
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => handleYearToggle(monthsInYear, allSelected)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-800">{year}</span>
                </label>
                <div className="pl-6 space-y-1 mt-1">
                    {monthsInYear.map(month => (
                        <label key={month} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-100">
                            <input
                                type="checkbox"
                                checked={selectedMonths.has(month)}
                                onChange={() => handleMonthToggle(month)}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-800">{formatMonthDisplay(month)}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
  };

  const hasExpenseData = transactions.length > 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">Budgets</h2>
          <div className="relative group">
            <button
              onClick={() => hasExpenseData && setIsModalOpen(true)}
              disabled={!hasExpenseData}
              className="flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md shadow hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="mr-2" /> Create New Budget
            </button>
            {!hasExpenseData && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Import expense data first to create a budget.
              </div>
            )}
          </div>
        </div>

        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => {
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
                  // Sort items within each group
                  for (const parent in groups) {
                      groups[parent].items.sort((a, b) => a.category.localeCompare(b.category));
                  }
                  return groups;
              })();

              const sortedParents = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

              return (
                <div key={budget.id} className="bg-slate-50 rounded-lg shadow-md p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-primary">{budget.name}</h3>
                      <p className="text-xl font-bold text-slate-700">{formatCurrencyWhole(totalBudget)}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={() => onPrintBudget(budget.id)} title="Print Budget" className="p-1 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200">
                            <PrinterIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDeleteBudget(budget.id)} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded flex-shrink-0">
                            Delete
                        </button>
                    </div>
                  </div>
                  <div className="flex-grow space-y-3 border-t pt-3 mt-3">
                    {sortedParents.map(parent => {
                      const group = groupedItems[parent];
                      return (
                        <div key={parent}>
                          <div className="flex justify-between text-xs font-bold text-slate-500 border-b pb-1">
                            <span>{parent}</span>
                            <span>{formatCurrencyWhole(group.total)}</span>
                          </div>
                          <div className="pl-2 space-y-1 mt-1">
                            {group.items.map(item => {
                              const { child } = parseCategory(item.category);
                              const displayName = child || item.category;
                              return (
                                <div key={item.category} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-700">{displayName}</span>
                                  <EditableBudgetValue
                                    value={item.amount}
                                    onSave={(newAmount) => onUpdateBudgetItem(budget.id, item.category, newAmount)}
                                    className="font-medium text-slate-800 text-right"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No budgets created</h3>
            <p className="mt-1 text-sm text-slate-500">Create a new budget from your expense history to get started.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Budget" maxWidth="max-w-4xl">
        <form onSubmit={handleCreateBudget} className="space-y-6">
          <div>
            <label htmlFor="budgetName" className="block text-sm font-medium text-slate-700">Budget Name</label>
            <input
              type="text"
              id="budgetName"
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-black"
              placeholder="e.g., 2024 Monthly Plan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-x-6 pt-4 border-t">
            {/* Months Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700">Include Expenses From:</h4>
              <div className="flex space-x-2">
                  <button type="button" onClick={handleSelectAllMonths} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Select All</button>
                  <button type="button" onClick={handleDeselectAllMonths} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Deselect All</button>
              </div>
              <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2">
                {Object.entries(groupedMonthsByYear).map(([year, monthsInYear]) => (
                  <YearCheckboxGroup
                    key={year}
                    year={year}
                    monthsInYear={monthsInYear}
                    selectedMonths={selectedMonths}
                  />
                ))}
              </div>
            </div>
            
            {/* Categories Column */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Include Categories:</h4>
                <div className="flex space-x-2">
                  <button type="button" onClick={handleSelectAllCategories} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Select All</button>
                  <button type="button" onClick={handleDeselectAllCategories} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded">Deselect All</button>
              </div>
                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1">
                  {Object.keys(categoryStructure).length > 0 ? Object.entries(categoryStructure).sort(([a], [b]) => a.localeCompare(b)).map(([parent, children]) => (
                      <div key={parent}>
                          <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-100 font-semibold">
                              <input
                                  type="checkbox"
                                  checked={selectedCategories.has(parent)}
                                  onChange={() => handleCategoryToggle(parent)}
                                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-slate-800">{parent}</span>
                          </label>
                          {children.length > 0 && (
                              <div className="pl-6">
                                  {children.map(child => {
                                      const fullCategory = `${parent}:${child}`;
                                      return (
                                          <label key={fullCategory} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-100">
                                              <input
                                                  type="checkbox"
                                                  checked={selectedCategories.has(fullCategory)}
                                                  onChange={() => handleCategoryToggle(fullCategory)}
                                                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                              />
                                              <span className="text-sm text-slate-600">{child}</span>
                                          </label>
                                      )
                                  })}
                              </div>
                          )}
                      </div>
                  )) : (
                      <p className="text-sm text-slate-500 p-2">No categories defined. Import transactions or create categories first.</p>
                  )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            The budget will be based on the monthly average of expenses from the selected months and categories.
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
            >
              Create Budget
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BudgetView;
