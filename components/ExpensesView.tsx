import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ExpenseTransaction, Budget, CategoryHierarchy, CategoryInclusionSettings } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import { formats } from '../utils/expenseFormatUtils';
import { parseCsv } from '../utils/csvParser';
import Modal from './Modal';
import { parseCategory } from '../utils/categoryUtils';
import { getBaseVendor } from '../utils/vendorUtils';
import { Chart } from 'chart.js/auto';
import { GoogleGenAI } from '@google/genai';

// --- ICONS ---
const ArrowUpTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 11.75a.75.75 0 0 0-1.5 0v-8.614L6.295 6.265a.75.75 0 1 0-1.09-1.03l4.25-4.5a.75.75 0 0 0 1.09 0l4.25 4.5a.75.75 0 0 0-1.09 1.03l-2.905-3.129v8.614Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);
const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
  </svg>
);
const ArrowsPointingInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
  </svg>
);
const ArrowTrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" />
  </svg>
);
const ArrowTrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 6 9 9 4.5-4.5L21.75 18" />
  </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.595c-.737.775-.242 2.056.697 2.246l5.256.811 2.339 4.991c.362.775 1.53.775 1.892 0l2.339-4.991 5.256-.811c.939-.19.939-1.471.2-2.246l-3.423-3.595-4.753-.39-1.83-4.401Z" clipRule="evenodd" />
  </svg>
);
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.875ZM10 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1.5-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
  </svg>
);


interface GroupedSubCategory { total: number; transactions: ExpenseTransaction[]; }
interface GroupedParentCategory { total: number; subCategories: Record<string, GroupedSubCategory>; }
interface GroupedMonth { total: number; parentCategories: Record<string, GroupedParentCategory>; }

interface ExpensesViewProps {
  transactions: ExpenseTransaction[];
  onTransactionsImported: (transactions: ExpenseTransaction[]) => { newCount: number, duplicateCount: number };
  budgets: Budget[];
  onUpdateTransactionCategory: (transactionId: string, newCategory: string) => void;
  onMassUpdateCategory: (transactionIds: string[], newCategory: string) => void;
  categoryStructure: CategoryHierarchy;
  categoryInclusion: CategoryInclusionSettings;
}

const EXPENSE_RELATED_TYPES = ['debit', 'sale', 'credit', 'return'];

const categoryColors = [
    '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#f87171', '#818cf8', '#facc15', '#a3e635'
];

const ExpensesView: React.FC<ExpensesViewProps> = ({ transactions, onTransactionsImported, budgets, onUpdateTransactionCategory, onMassUpdateCategory, categoryStructure, categoryInclusion }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string>(formats[0]?.id || '');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedParentCategories, setExpandedParentCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  
  const [isAnalysisResultModalOpen, setIsAnalysisResultModalOpen] = useState(false);
  const [analysisResultText, setAnalysisResultText] = useState('');

  const categoryChartCanvasRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<Chart | null>(null);

  const [analyzingExpenses, setAnalyzingExpenses] = useState(false);
  const [expenseAnomalies, setExpenseAnomalies] = useState<Record<string, string>>({});

  const [analysisMonth, setAnalysisMonth] = useState<string>('');

  const [selectedMonth, setSelectedMonth] = useState<string>('');

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
  
  const formatMonth = (monthKey: string) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Set initial month for dashboard
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const availableAnalysisMonths = useMemo(() => availableMonths, [availableMonths]);

  useEffect(() => {
    // Set initial analysis month to the latest one available.
    if (availableAnalysisMonths.length > 0 && !analysisMonth) {
      setAnalysisMonth(availableAnalysisMonths[0]);
    }
  }, [availableAnalysisMonths, analysisMonth]);


  useEffect(() => {
    if (selectedBudgetId && !budgets.some(b => b.id === selectedBudgetId)) {
        setSelectedBudgetId('');
    }
  }, [budgets, selectedBudgetId]);

  const selectedBudget = useMemo(() => budgets.find(b => b.id === selectedBudgetId), [selectedBudgetId, budgets]);
  
  const budgetMap = useMemo(() => {
    if (!selectedBudget) return null;
    const map = new Map<string, number>();
    selectedBudget.items.forEach(item => {
        map.set(item.category, item.amount);
    });
    return map;
  }, [selectedBudget]);

  const transactionsForSelectedMonth = useMemo(() => {
    if (!selectedMonth) return [];
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const targetYear = year;
    const targetMonth = month - 1; // getMonth is 0-indexed

    return transactions.filter(tx => {
        const txDate = new Date(tx.transactionDate);
        if (!(txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth && EXPENSE_RELATED_TYPES.includes(tx.type.toLowerCase()))) {
            return false;
        }

        const { parent, child } = parseCategory(tx.category);
        const fullCategoryName = child ? `${parent}:${child}` : parent;
        if (categoryInclusion[fullCategoryName] === false || categoryInclusion[parent] === false) {
            return false;
        }

        return true;
    });
  }, [transactions, categoryInclusion, selectedMonth]);

  const { groupedExpenses, searchTotal } = useMemo(() => {
    const grouped: Record<string, GroupedMonth> = {};

    const filteredBySearch = transactions.filter(tx =>
      tx.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const finalFiltered = filteredBySearch.filter(tx =>
      EXPENSE_RELATED_TYPES.includes(tx.type.toLowerCase())
    );

    const total = finalFiltered.reduce((sum, tx) => sum + tx.amount, 0);

    finalFiltered.forEach(tx => {
      const date = new Date(tx.transactionDate);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const { parent, child } = parseCategory(tx.category || 'Uncategorized');
      const subCategoryKey = child ? `${parent}:${child}` : parent;
      const amount = tx.amount;
      if (!grouped[monthKey]) grouped[monthKey] = { total: 0, parentCategories: {} };
      if (!grouped[monthKey].parentCategories[parent]) grouped[monthKey].parentCategories[parent] = { total: 0, subCategories: {} };
      if (!grouped[monthKey].parentCategories[parent].subCategories[subCategoryKey]) grouped[monthKey].parentCategories[parent].subCategories[subCategoryKey] = { total: 0, transactions: [] };
      grouped[monthKey].total += amount;
      grouped[monthKey].parentCategories[parent].total += amount;
      grouped[monthKey].parentCategories[parent].subCategories[subCategoryKey].total += amount;
      grouped[monthKey].parentCategories[parent].subCategories[subCategoryKey].transactions.push(tx);
    });

    for (const month in grouped) {
      for (const parent in grouped[month].parentCategories) {
        for (const sub in grouped[month].parentCategories[parent].subCategories) {
          grouped[month].parentCategories[parent].subCategories[sub].transactions.sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        }
      }
    }

    return { groupedExpenses: grouped, searchTotal: total };
  }, [transactions, searchTerm]);

  const handleAnalyzeExpenses = async () => {
    if (!analysisMonth) {
      alert("Please select a month to analyze.");
      return;
    }

    const transactionsForMonth = transactions.filter(tx => {
      const date = new Date(tx.transactionDate);
      if (isNaN(date.getTime())) return false;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthKey !== analysisMonth || !EXPENSE_RELATED_TYPES.includes(tx.type.toLowerCase())) {
        return false;
      }

      const { parent, child } = parseCategory(tx.category);
      const fullCategoryName = child ? `${parent}:${child}` : parent;
      if (categoryInclusion[fullCategoryName] === false || categoryInclusion[parent] === false) {
        return false;
      }
      return true;
    });

    if (transactionsForMonth.length === 0) {
        alert(`No included transactions found for ${formatMonth(analysisMonth)} to analyze.`);
        return;
    }

    setAnalyzingExpenses(true);
    setExpenseAnomalies({});

    try {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            throw new Error("VITE_API_KEY is not defined in the environment. Please configure it in your .env file.");
        }
        const ai = new GoogleGenAI({ apiKey });
        
        const transactionsForPrompt = transactionsForMonth.map(tx => ({
            id: tx.id,
            description: tx.description,
            category: tx.category,
            amount: Math.abs(tx.amount)
        }));
        
        const prompt = `
            Analyze the following list of transactions for the month of ${formatMonth(analysisMonth)} and identify up to 10 anomalies.
            An anomaly could be an unusually large expense for a given category, a purchase from a new or infrequent vendor, or spending in a rarely used category.
            For each anomaly, provide a brief, user-friendly reason (less than 15 words).
            Respond with ONLY a JSON array of objects, where each object has "id" (the transaction ID) and "reason" (your explanation).
            Example response: [{"id": "xyz-123", "reason": "This is an unusually large expense for the 'Shopping' category."}]

            Transactions:
            ${JSON.stringify(transactionsForPrompt, null, 2)}
        `;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        let jsonStr = response.text.trim();
        
        const fenceRegex = /`{3}(?:json)?\s*([\s\S]*?)\s*`{3}/;
        const match = jsonStr.match(fenceRegex);
        
        if (match && match[1]) {
          jsonStr = match[1].trim();
        } else {
            const firstOpen = jsonStr.indexOf('{');
            const firstSquare = jsonStr.indexOf('[');
            let start = -1;

            if (firstOpen === -1) {
                start = firstSquare;
            } else if (firstSquare === -1) {
                start = firstOpen;
            } else {
                start = Math.min(firstOpen, firstSquare);
            }

            if (start !== -1) {
                const lastClose = jsonStr.lastIndexOf('}');
                const lastSquare = jsonStr.lastIndexOf(']');
                const end = Math.max(lastClose, lastSquare);
                if (end > start) {
                    jsonStr = jsonStr.substring(start, end + 1);
                }
            }
        }
        
        const anomaliesResult = JSON.parse(jsonStr);
        const anomalies: {id: string, reason: string}[] = Array.isArray(anomaliesResult) 
            ? anomaliesResult
            : [anomaliesResult];

        if (!Array.isArray(anomalies) || (anomalies.length > 0 && (typeof anomalies[0].id === 'undefined' || typeof anomalies[0].reason === 'undefined'))) {
             throw new Error("API response was not a valid JSON array of anomalies.");
        }
        
        const anomalyMap = anomalies.reduce((acc, anomaly) => {
            if (anomaly.id && anomaly.reason) {
                acc[anomaly.id] = anomaly.reason;
            }
            return acc;
        }, {} as Record<string, string>);
        
        setExpenseAnomalies(anomalyMap);

        const anomalyIds = new Set(Object.keys(anomalyMap));
        if (anomalyIds.size > 0) {
            const newExpandedMonths = new Set<string>();
            const newExpandedParents = new Set<string>();
            const newExpandedSubs = new Set<string>();

            Object.entries(groupedExpenses).forEach(([monthKey, monthData]) => {
                Object.entries(monthData.parentCategories).forEach(([parentKey, parentData]) => {
                    const parentCompositeKey = `${monthKey}-${parentKey}`;
                    const parentHasSubCategories = !(Object.keys(parentData.subCategories).length === 1 && Object.keys(parentData.subCategories)[0] === parentKey);

                    Object.entries(parentData.subCategories).forEach(([subKey, subData]) => {
                        const hasAnomaly = subData.transactions.some(tx => anomalyIds.has(tx.id));
                        if (hasAnomaly) {
                            newExpandedMonths.add(monthKey);
                            newExpandedParents.add(parentCompositeKey);
                            if (parentHasSubCategories) {
                                const subCompositeKey = `${parentCompositeKey}-${subKey}`;
                                newExpandedSubs.add(subCompositeKey);
                            }
                        }
                    });
                });
            });

            setExpandedMonths(prev => new Set([...prev, ...newExpandedMonths]));
            setExpandedParentCategories(prev => new Set([...prev, ...newExpandedParents]));
            setExpandedSubCategories(prev => new Set([...prev, ...newExpandedSubs]));
        }

        const anomalyCount = Object.keys(anomalyMap).length;
        const pluralizedNoun = anomalyCount === 1 ? 'anomaly' : 'anomalies';
        if (anomalyCount > 0) {
            setAnalysisResultText(`Analysis complete. Found ${anomalyCount} potential ${pluralizedNoun}. They have been highlighted and expanded in the list.`);
        } else {
            setAnalysisResultText(`Analysis complete. No anomalies were found in ${formatMonth(analysisMonth)}'s transactions.`);
        }
        setIsAnalysisResultModalOpen(true);

    } catch (e) {
        console.error("Error analyzing expenses:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setAnalysisResultText(`Failed to analyze expenses: ${errorMessage}`);
        setIsAnalysisResultModalOpen(true);
        setExpenseAnomalies({});
    } finally {
        setAnalyzingExpenses(false);
    }
  };

  // -- DASHBOARD CALCULATIONS --
  const selectedMonthMetrics = useMemo(() => {
    if (!selectedMonth) return { currentMonthTotal: 0, change: 0 };
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentYear = year;
    const currentMonth = month - 1; // 0-indexed
    
    const prevMonthDate = new Date(currentYear, currentMonth, 0); // Day 0 gives last day of previous month
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const getMonthNetExpense = (year: number, month: number) => {
        return transactions
            .filter(tx => {
                const txDate = new Date(tx.transactionDate);
                if (!(txDate.getFullYear() === year && txDate.getMonth() === month && EXPENSE_RELATED_TYPES.includes(tx.type.toLowerCase()))) {
                    return false;
                }
                const { parent, child } = parseCategory(tx.category);
                const fullCategoryName = child ? `${parent}:${child}` : parent;

                if (categoryInclusion[fullCategoryName] === false || categoryInclusion[parent] === false) {
                    return false;
                }
                
                return true;
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
    };

    const currentMonthNetExpense = getMonthNetExpense(currentYear, currentMonth);
    const prevMonthNetExpense = getMonthNetExpense(prevYear, prevMonth);
    
    let change = 0;
    if (prevMonthNetExpense < 0 && prevMonthNetExpense !== 0) {
        change = ((currentMonthNetExpense - prevMonthNetExpense) / prevMonthNetExpense) * 100;
    } else if (currentMonthNetExpense < 0) {
        change = -100; // From zero spending to some spending
    }

    return { currentMonthTotal: Math.abs(currentMonthNetExpense), change };
  }, [transactions, categoryInclusion, selectedMonth]);
  
  const categorySpendingData = useMemo(() => {
    const spendingTotals: Record<string, number> = {};
    transactionsForSelectedMonth.forEach(tx => {
        const { parent } = parseCategory(tx.category);
        spendingTotals[parent] = (spendingTotals[parent] || 0) + tx.amount;
    });

    if (selectedBudget) {
        const budgetTotals: Record<string, number> = {};
        selectedBudget.items.forEach(item => {
            const { parent } = parseCategory(item.category);
            budgetTotals[parent] = (budgetTotals[parent] || 0) + item.amount;
        });

        const allCategoryKeys = new Set([...Object.keys(spendingTotals), ...Object.keys(budgetTotals)]);
        const labels = Array.from(allCategoryKeys).sort((a, b) => {
            const valA = Math.abs(spendingTotals[a] || 0) + (budgetTotals[a] || 0);
            const valB = Math.abs(spendingTotals[b] || 0) + (budgetTotals[b] || 0);
            return valB - valA;
        });

        return {
            labels,
            spendingData: labels.map(label => Math.abs(spendingTotals[label] || 0)),
            budgetData: labels.map(label => budgetTotals[label] || 0),
        };

    } else {
        const sorted = Object.entries(spendingTotals).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]));
        const topCategories = sorted.slice(0, 7);
        const otherTotal = sorted.slice(7).reduce((sum, item) => sum + item[1], 0);

        if(otherTotal !== 0) topCategories.push(['Other', otherTotal]);
        
        return {
            labels: topCategories.map(item => item[0]),
            spendingData: topCategories.map(item => Math.abs(item[1])),
            budgetData: null,
        };
    }
  }, [transactionsForSelectedMonth, selectedBudget]);
  
  
  useEffect(() => {
    if (!categoryChartCanvasRef.current) return;
    const ctx = categoryChartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (categoryChartRef.current) {
        categoryChartRef.current.destroy();
    }

    const isBudgetView = !!categorySpendingData.budgetData;

    // Custom plugin to draw data labels on the bars
    const dataLabelsPlugin = {
        id: 'customDataLabels',
        afterDatasetsDraw: (chart: Chart) => {
            const { ctx, data } = chart;
            ctx.save();
            ctx.font = '600 10px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#64748b'; // slate-500

            data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        const value = dataset.data[index];
                        if (typeof value === 'number' && value > 0) {
                            const formattedValue = formatCurrencyWhole(value);
                            ctx.fillText(formattedValue, element.x + 5, element.y);
                        }
                    });
                }
            });
            ctx.restore();
        }
    };

    categoryChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorySpendingData.labels,
            datasets: isBudgetView
            ? [
                {
                    label: 'Spent',
                    data: categorySpendingData.spendingData,
                    backgroundColor: '#ef4444', // red-500
                    borderRadius: 4,
                },
                {
                    label: 'Budget',
                    data: categorySpendingData.budgetData as number[],
                    backgroundColor: '#a1a1aa', // zinc-400
                    borderRadius: 4,
                },
              ]
            : [{
                label: 'Spent',
                data: categorySpendingData.spendingData,
                backgroundColor: categoryColors,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y', // Set to horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: isBudgetView,
                    position: 'top',
                    align: 'end',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrencyWhole(context.parsed.x)}`;
                        }
                    }
                }
            },
            scales: {
                x: { // Value axis
                    beginAtZero: true,
                    border: {
                        display: false,
                    },
                    grid: {
                        color: '#e2e8f0', // slate-200
                    },
                    ticks: {
                        font: { size: 10 },
                        callback: function(value) {
                             return formatCurrencyWhole(Number(value));
                        }
                    },
                    afterDataLimits(scale) {
                        scale.max = scale.max * 1.25;
                    },
                },
                y: { // Category axis
                    grid: {
                        display: false,
                    },
                    ticks: {
                        font: { size: 10 },
                    }
                }
            }
        },
        plugins: [dataLabelsPlugin] // Register the custom plugin
    });

    return () => { if (categoryChartRef.current) categoryChartRef.current.destroy(); };
  }, [categorySpendingData]);
  
  const budgetProgress = useMemo(() => {
    if (!selectedBudget) return null;
    const budgetMap = new Map(selectedBudget.items.map(i => [i.category, i.amount]));
    const budgetTotal = selectedBudget.items.reduce((sum, i) => sum + i.amount, 0);
    
    const netExpense = transactionsForSelectedMonth.reduce((sum, tx) => {
        const { parent, child } = parseCategory(tx.category);
        const subCategory = child ? `${parent}:${child}` : parent;
        if(budgetMap.has(parent) || budgetMap.has(subCategory)) {
            return sum + tx.amount;
        }
        return sum;
    }, 0);
    
    const spentTotal = Math.abs(netExpense);

    return {
        spent: spentTotal,
        total: budgetTotal,
        remaining: budgetTotal - spentTotal,
        progress: budgetTotal > 0 ? (spentTotal / budgetTotal) * 100 : 0,
    };
  }, [selectedBudget, transactionsForSelectedMonth]);
  
  // -- SELECTION & IMPORT HANDLERS --
  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedTxIds(prev => { const newSet = new Set(prev); if (isSelected) newSet.add(id); else newSet.delete(id); return newSet; });
  };
  const handleSelectAllInGroup = (ids: string[]) => setSelectedTxIds(prev => new Set([...prev, ...ids]));
  const handleDeselectAllInGroup = (ids: string[]) => setSelectedTxIds(prev => { const newSet = new Set(prev); ids.forEach(id => newSet.delete(id)); return newSet; });
  const handleBulkCategoryChange = (newCategoryValue: string) => {
    if (!newCategoryValue || selectedTxIds.size === 0) return;
    let categoryToSet = newCategoryValue;
    if (newCategoryValue === '___CREATE_NEW___') {
        const newCategoryName = window.prompt('Enter new category name (use "Parent:Child" for sub-categories):');
        if (!newCategoryName || !newCategoryName.trim()) {
            const selectElement = document.getElementById('bulk-category-selector') as HTMLSelectElement; if(selectElement) selectElement.value = ""; return; 
        }
        categoryToSet = newCategoryName.trim();
    }
    onMassUpdateCategory(Array.from(selectedTxIds), categoryToSet);
    setSelectedTxIds(new Set());
  };
  const handleCategoryChange = (transactionId: string, newCategoryValue: string) => {
    if (newCategoryValue === '___CREATE_NEW___') {
      const newCategoryName = window.prompt('Enter new category name (use "Parent:Child" for sub-categories).');
      if (newCategoryName && newCategoryName.trim()) onUpdateTransactionCategory(transactionId, newCategoryName.trim());
    } else {
      onUpdateTransactionCategory(transactionId, newCategoryValue);
    }
  };

  const handleImportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem('csvFiles') as HTMLInputElement;
    const files = fileInput.files;
    if (!files || files.length === 0) { alert("Please select one or more files to import."); return; }
    const selectedFormat = formats.find(f => f.id === selectedFormatId);
    if (!selectedFormat) { alert("Please select a valid import format."); return; }
    let allNewTransactions: ExpenseTransaction[] = [];
    let successfulFiles = 0; let failedFiles = 0; const failedFileNames: string[] = [];
    const fileReadPromises = Array.from(files).map(file => new Promise<{ fileName: string, content: string }>((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => resolve({ fileName: file.name, content: e.target?.result as string }); reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`)); reader.readAsText(file); }));
    const readResults = await Promise.allSettled(fileReadPromises);
    readResults.forEach(result => { if (result.status === 'fulfilled') { try { const parsedTxs = parseCsv(result.value.content, selectedFormat); allNewTransactions.push(...parsedTxs); successfulFiles++; } catch (error) { failedFiles++; failedFileNames.push(result.value.fileName); console.error(`Error processing ${result.value.fileName}:`, error); } } else { failedFiles++; console.error(`Error reading file:`, result.reason); } });
    
    let importResult = { newCount: 0, duplicateCount: 0 };
    if (allNewTransactions.length > 0) {
        importResult = onTransactionsImported(allNewTransactions);
    }

    let alertMessage = `Import complete. Imported ${importResult.newCount} new transactions from ${successfulFiles} files.`;
    if (importResult.duplicateCount > 0) {
      alertMessage += `\nSkipped ${importResult.duplicateCount} duplicate transaction(s).`;
    }
    if (failedFiles > 0) {
      alertMessage += `\n\nFailed to import ${failedFiles} files: ${failedFileNames.join(', ')}. See console for details.`;
    }
    alert(alertMessage);
    setIsImportModalOpen(false);
  };
  
  const CategorySelector: React.FC<{ value: string; onChange: (value: string) => void; className?: string; id?: string; }> = ({ value, onChange, className, id }) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className} onClick={(e) => e.stopPropagation()}>
        <option value="">Change category...</option>
        {Object.entries(categoryStructure).sort(([a], [b]) => a.localeCompare(b)).map(([parent, children]) =>(
            <optgroup key={parent} label={parent}> <option value={parent}>{parent}</option> {children.map(child => <option key={`${parent}:${child}`} value={`${parent}:${child}`}>&nbsp;&nbsp;{child}</option>)} </optgroup>
        ))}
        <optgroup label="Actions"><option value="___CREATE_NEW___">Create New...</option></optgroup>
    </select>
  );

  const TransactionList: React.FC<{ transactions: ExpenseTransaction[] }> = ({ transactions: txs }) => {
    const allIdsInList = useMemo(() => txs.map(tx => tx.id), [txs]);
    const areAllSelected = useMemo(() => allIdsInList.length > 0 && allIdsInList.every(id => selectedTxIds.has(id)), [allIdsInList, selectedTxIds]);
    return (<div className="px-3 pb-2 sm:px-4 sm:pb-3 text-xs"> <div className="grid grid-cols-[auto,2fr,4fr,3fr,2fr] gap-x-2 text-slate-500 font-bold p-2 border-t border-b bg-slate-50 items-center"> <div className="flex items-center"> <input type="checkbox" title={areAllSelected ? "Deselect all in this group" : "Select all in this group"} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" checked={areAllSelected} onChange={() => areAllSelected ? handleDeselectAllInGroup(allIdsInList) : handleSelectAllInGroup(allIdsInList)} /> </div> <div>Date</div> <div>Description</div> <div>Category</div> <div className="text-right">Amount</div> </div> {txs.map(tx => {
        const isAnomaly = !!expenseAnomalies[tx.id];
        const rowClasses = isAnomaly
            ? "grid grid-cols-[auto,2fr,4fr,3fr,2fr] gap-x-2 items-center p-2 border-b border-amber-200 last:border-b-0 bg-amber-50"
            : "grid grid-cols-[auto,2fr,4fr,3fr,2fr] gap-x-2 items-center p-2 border-b border-slate-100 last:border-b-0";

        return (
            <div key={tx.id} className={rowClasses}>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={selectedTxIds.has(tx.id)}
                        onChange={(e) => handleSelectionChange(tx.id, e.target.checked)}
                    />
                </div>
                <div className="text-slate-600">{tx.transactionDate}</div>
                <div className="text-slate-800 break-words flex items-center gap-1">
                    <span>{tx.description}</span>
                    {isAnomaly && (
                        <div className="relative group">
                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 cursor-pointer" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                AI Anomaly: {expenseAnomalies[tx.id]}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <CategorySelector
                        value={tx.category}
                        onChange={(newValue) => handleCategoryChange(tx.id, newValue)}
                        className="w-full text-xs p-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className={`text-right font-medium ${tx.amount < 0 ? 'text-red-600' : tx.amount > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                    {formatCurrencyWhole(Math.abs(tx.amount))}
                </div>
            </div>
        );
    })} </div>);
  };
  
  const sortedMonthKeys = Object.keys(groupedExpenses).sort().reverse();
  
  useEffect(() => { 
    if (searchTerm.trim()) { 
      const newExpandedMonths = new Set<string>(); 
      const newExpandedParents = new Set<string>(); 
      const newExpandedSubs = new Set<string>(); 
      Object.entries(groupedExpenses).forEach(([monthKey, monthData]) => { 
        newExpandedMonths.add(monthKey); 
        Object.entries(monthData.parentCategories).forEach(([parentKey, parentData]) => { 
          const parentCompositeKey = `${monthKey}-${parentKey}`; 
          newExpandedParents.add(parentCompositeKey); 
          const subCategoryKeys = Object.keys(parentData.subCategories); 
          const hasSubCategories = !(subCategoryKeys.length === 1 && subCategoryKeys[0] === parentKey); 
          if (hasSubCategories) {
            subCategoryKeys.forEach(subKey => { 
              const subCompositeKey = `${parentCompositeKey}-${subKey}`; 
              newExpandedSubs.add(subCompositeKey); 
            }); 
          }
        }); 
      }); 
      setExpandedMonths(newExpandedMonths); 
      setExpandedParentCategories(newExpandedParents); 
      setExpandedSubCategories(newExpandedSubs); 
    } 
  }, [searchTerm, groupedExpenses]);

  const groupContainsAnomalies = (transactions: ExpenseTransaction[]): boolean => {
      if (Object.keys(expenseAnomalies).length === 0) return false;
      return transactions.some(tx => expenseAnomalies[tx.id]);
  };
  
  const toggleMonth = (key: string) => setExpandedMonths(p => p.has(key) ? (new Set([...p].filter(k => k !== key))) : new Set([...p, key]));
  const toggleParentCategory = (key: string) => setExpandedParentCategories(p => p.has(key) ? (new Set([...p].filter(k => k !== key))) : new Set([...p, key]));
  const toggleSubCategory = (key: string) => setExpandedSubCategories(p => p.has(key) ? (new Set([...p].filter(k => k !== key))) : new Set([...p, key]));
  const handleCollapseAll = () => { setExpandedMonths(new Set()); setExpandedParentCategories(new Set()); setExpandedSubCategories(new Set()); };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Expense Analysis</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative w-full sm:w-64"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400" /></div><input type="text" placeholder="Search descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-md border-slate-300 py-2.5 pl-10 pr-3 text-base shadow-sm focus:border-primary focus:ring-primary bg-white text-black"/></div>
            
            <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
                <select
                    id="analysis-month-select"
                    value={analysisMonth}
                    onChange={(e) => setAnalysisMonth(e.target.value)}
                    className="flex-shrink-0 block w-full sm:w-auto rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white text-black py-2"
                    aria-label="Select month to analyze"
                    disabled={analyzingExpenses}
                >
                    {availableAnalysisMonths.map(month => (
                        <option key={month} value={month}>
                            {formatMonth(month)}
                        </option>
                    ))}
                </select>
                <button onClick={handleAnalyzeExpenses} disabled={analyzingExpenses || !analysisMonth} className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-md shadow hover:bg-violet-700 transition disabled:opacity-50">
                    {analyzingExpenses ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SparklesIcon className="mr-2 w-5 h-5"/>
                    )}
                    {analyzingExpenses ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>

            <div className="flex items-stretch gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
                <button onClick={() => setIsImportModalOpen(true)} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md shadow hover:bg-slate-700 transition"><ArrowUpTrayIcon className="mr-2" />Import</button>
                <button onClick={handleCollapseAll} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md shadow hover:bg-slate-700 transition"><ArrowsPointingInIcon className="mr-2 w-5 h-5" /> Collapse All</button>
            </div>
            
          </div>
        </div>

        {/* --- MONTH SELECTOR & DASHBOARD --- */}
        <div className="space-y-6">
            {availableMonths.length > 0 && (
                <div className="pb-4 border-b">
                    <label htmlFor="month-select" className="block text-sm font-medium text-slate-600 mb-1">
                        Showing Dashboard For:
                    </label>
                    <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white text-black"
                    >
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {formatMonth(month)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[16rem]">
                <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between ring-1 ring-slate-100">
                    <div>
                        {budgetProgress ? (
                            // --- BUDGET SELECTED VIEW ---
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">{selectedBudget?.name} - Progress</h3>
                                <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                                    <div className="w-full md:w-1/3 text-center md:text-left">
                                        <p className="text-sm text-slate-500">Spent This Month</p>
                                        <p className="text-4xl font-bold text-red-600">{formatCurrencyWhole(budgetProgress.spent)}</p>
                                        <p className="text-sm text-slate-500"> of {formatCurrencyWhole(budgetProgress.total)}</p>
                                    </div>
                                    <div className="w-full md:w-2/3">
                                        <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                                            <span>{budgetProgress.progress.toFixed(1)}% Used</span>
                                            <span className={`${budgetProgress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrencyWhole(budgetProgress.remaining)} {budgetProgress.remaining >= 0 ? 'left' : 'over'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-4"><div className="bg-primary h-4 rounded-full" style={{ width: `${Math.min(budgetProgress.progress, 100)}%` }}></div></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- NO BUDGET SELECTED VIEW ---
                            <div className="flex flex-col justify-center text-center">
                                <h3 className="font-semibold text-slate-500 text-sm mb-2">Spending for {formatMonth(selectedMonth)}</h3>
                                <p className="text-3xl font-bold text-red-600">{formatCurrencyWhole(selectedMonthMetrics.currentMonthTotal)}</p>
                                <div className={`flex items-center justify-center text-sm font-semibold mt-1 ${selectedMonthMetrics.change <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {selectedMonthMetrics.change <= 0 ? <ArrowTrendingDownIcon className="w-4 h-4 mr-1"/> : <ArrowTrendingUpIcon className="w-4 h-4 mr-1"/>}
                                    {Math.abs(selectedMonthMetrics.change).toFixed(1)}% vs last month
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* --- UNIFIED BUDGET SELECTOR AT THE BOTTOM --- */}
                    {budgets.length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                            <label htmlFor="budget-select-unified" className="block text-sm font-medium text-slate-600 mb-1">
                                {selectedBudget ? 'Current Budget:' : 'Compare with a budget:'}
                            </label>
                            <select 
                                id="budget-select-unified" 
                                value={selectedBudgetId} 
                                onChange={e => setSelectedBudgetId(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white text-black"
                            >
                                <option value="">{selectedBudget ? '— No Budget —' : 'Select a Budget'}</option>
                                {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-xl shadow p-5 flex flex-col ring-1 ring-slate-100 min-h-0">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        {budgetProgress ? 'Spending vs. Budget' : 'Spending by Category'}
                    </h3>
                    <div className="relative flex-grow min-h-0"><canvas ref={categoryChartCanvasRef}></canvas></div>
                </div>
            </div>
        </div>


        {/* --- DETAILED TRANSACTION LIST --- */}
        <div className="pt-6 mt-6 border-t">
            {searchTerm.trim() && (
              <div className="bg-sky-100 border border-sky-200 text-sky-800 rounded-lg p-3 mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="font-semibold">Search Results Net Total:</span>
                </div>
                <span className={`text-lg font-bold ${searchTotal < 0 ? 'text-red-700' : 'text-green-700'}`}>{formatCurrencyWhole(Math.abs(searchTotal))}</span>
              </div>
            )}
            {sortedMonthKeys.length > 0 ? (<div className="space-y-4"> {sortedMonthKeys.map(monthKey => { const monthData = groupedExpenses[monthKey]; const isMonthExpanded = expandedMonths.has(monthKey); const sortedParentCategoryKeys = Object.keys(monthData.parentCategories).sort((a,b) => Math.abs(monthData.parentCategories[b].total) - Math.abs(monthData.parentCategories[a].total)); const categorizedMonthNetExpense = Object.entries(monthData.parentCategories) .filter(([parentKey, _]) => categoryInclusion[parentKey] !== false) .reduce((sum, [parentKey, parentData]) => { const parentNetExpense = Object.entries(parentData.subCategories) .reduce((subSum, [subKey, subData]) => { const fullCategoryName = parentKey === subKey ? parentKey : `${parentKey}:${subKey}`; if (categoryInclusion[fullCategoryName] !== false) { return subSum + subData.total; } return subSum; }, 0); return sum + parentNetExpense; }, 0); const categorizedMonthTotalSpent = Math.abs(categorizedMonthNetExpense); const categorizedBudgetForMonth = selectedBudget ? selectedBudget.items.reduce((sum, item) => sum + item.amount, 0) : 0; const totalDifference = categorizedBudgetForMonth - categorizedMonthTotalSpent; const allMonthTransactions = Object.values(monthData.parentCategories).flatMap(parent => Object.values(parent.subCategories).flatMap(sub => sub.transactions)); const monthHasAnomaly = groupContainsAnomalies(allMonthTransactions); return ( <div key={monthKey} className={`border rounded-lg transition-all duration-300 ${isMonthExpanded ? 'border-sky-300 shadow-lg' : 'border-slate-200'}`}> <div className={`flex items-center p-3 sm:p-4 cursor-pointer rounded-t-lg transition-colors ${isMonthExpanded ? 'bg-primary-light' : 'bg-slate-50'}`} onClick={() => toggleMonth(monthKey)}> <div className="flex-grow"> <h3 className="font-semibold text-primary flex items-center gap-2">{formatMonth(monthKey)} {monthHasAnomaly && <span title="This month contains anomalous transactions"><ExclamationTriangleIcon className="h-5 w-5 text-amber-500"/></span>}</h3> <p className="text-sm text-slate-500">{selectedBudget ? 'Actual vs. Budget (Included in Total)' : 'Total Included Expenses'}</p> </div> <div className="text-right"> <p className="font-bold text-lg text-slate-800">{formatCurrencyWhole(categorizedMonthTotalSpent)}</p> {selectedBudget && ( <p className="text-xs text-slate-500"> Budget: {formatCurrencyWhole(categorizedBudgetForMonth)} <span className={`ml-2 font-semibold ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}> ({totalDifference >= 0 ? '+' : ''}{formatCurrencyWhole(totalDifference)}) </span> </p> )} </div> <div className="pl-4 text-slate-400">{isMonthExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}</div> </div> {isMonthExpanded && ( <div className="p-2 sm:p-3 space-y-2"> {sortedParentCategoryKeys.map(parentKey => { const parentData = monthData.parentCategories[parentKey]; const parentCompositeKey = `${monthKey}-${parentKey}`; const isParentExpanded = expandedParentCategories.has(parentCompositeKey); const sortedSubCategoryKeys = Object.keys(parentData.subCategories).sort((a,b) => Math.abs(parentData.subCategories[b].total) - Math.abs(parentData.subCategories[a].total)); const hasSubCategories = !(sortedSubCategoryKeys.length === 1 && sortedSubCategoryKeys[0] === parentKey); const parentTotalSpent = Math.abs(parentData.total); const budgetForParent = selectedBudget ? selectedBudget.items.filter(item => item.category === parentKey || item.category.startsWith(`${parentKey}:`)).reduce((sum, item) => sum + item.amount, 0) : 0; const differenceForParent = budgetForParent - parentTotalSpent; const allParentTransactions = Object.values(parentData.subCategories).flatMap(sub => sub.transactions); const parentHasAnomaly = groupContainsAnomalies(allParentTransactions); const isParentIncluded = categoryInclusion[parentKey] !== false; return ( <div key={parentCompositeKey} className="border border-slate-200 rounded-md"> <div className={`flex items-center p-2 cursor-pointer ${isParentIncluded ? 'bg-green-50' : 'bg-slate-100/50'}`} onClick={() => toggleParentCategory(parentCompositeKey)}> <div className="flex-grow font-semibold text-slate-700 flex items-center gap-2">{parentKey} {parentHasAnomaly && <span title="This category contains anomalous transactions"><ExclamationTriangleIcon className="h-4 w-4 text-amber-500"/></span>}</div> <div className="text-right"> <p className="font-bold text-slate-800 text-sm">{formatCurrencyWhole(parentTotalSpent)}</p> {selectedBudget && budgetForParent > 0 && ( <p className="text-xs text-slate-500"> Budget: {formatCurrencyWhole(budgetForParent)} <span className={`ml-2 font-semibold ${differenceForParent >= 0 ? 'text-green-600' : 'text-red-600'}`}> ({differenceForParent >= 0 ? '+' : ''}{formatCurrencyWhole(differenceForParent)}) </span> </p> )} </div> <div className="pl-3 text-slate-400">{isParentExpanded ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}</div> </div> {isParentExpanded && ( hasSubCategories ? ( <div className="pl-2 pr-1 py-1"> {sortedSubCategoryKeys.map(subKey => { const subData = parentData.subCategories[subKey]; const subCompositeKey = `${parentCompositeKey}-${subKey}`; const isSubExpanded = expandedSubCategories.has(subCompositeKey); const subTotalSpent = Math.abs(subData.total); const budgetForSub = budgetMap?.get(subKey) ?? 0; const differenceForSub = budgetForSub - subTotalSpent; const subHasAnomaly = groupContainsAnomalies(subData.transactions); const isSubIncluded = categoryInclusion[parentKey] !== false && categoryInclusion[subKey] !== false; return ( <div key={subCompositeKey}> <div className={`grid grid-cols-[1fr,8fr,4fr] sm:grid-cols-12 items-center gap-2 p-2 cursor-pointer rounded ${isSubIncluded ? 'bg-green-50' : 'hover:bg-slate-50'}`} onClick={() => toggleSubCategory(subCompositeKey)}> <div className="col-span-1 text-slate-400">{isSubExpanded ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}</div> <div className="col-span-7 font-medium text-sm text-slate-600 flex items-center gap-2">{subKey} {subHasAnomaly && <span title="This sub-category contains anomalous transactions"><ExclamationTriangleIcon className="h-4 w-4 text-amber-500" /></span>}</div> <div className="col-span-4 text-right text-sm"> <p className="font-semibold">{formatCurrencyWhole(subTotalSpent)}</p> {selectedBudget && budgetForSub > 0 && ( <p className="text-xs text-slate-500"> of {formatCurrencyWhole(budgetForSub)} <span className={`ml-1 font-medium ${differenceForSub >= 0 ? 'text-green-600' : 'text-red-600'}`}> ({differenceForSub >= 0 ? '+' : ''}{formatCurrencyWhole(differenceForSub)}) </span> </p> )} </div> </div> {isSubExpanded && <TransactionList transactions={subData.transactions} />} </div> ) })} </div> ) : ( parentData.subCategories[parentKey] ? <TransactionList transactions={parentData.subCategories[parentKey].transactions} /> : null ) )} </div> ) })} </div> )} </div> ); })} </div> ) : ( <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg"> <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> {searchTerm ? ( <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> ) : ( <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" /> )} </svg> <h3 className="mt-2 text-sm font-medium text-slate-900">{searchTerm ? 'No matching expenses' : 'No expense data'}</h3> <p className="mt-1 text-sm text-slate-500"> {searchTerm ? `No transactions found matching "${searchTerm}". Try a different search.` : 'Get started by importing a CSV file with your transactions.'} </p> d</div> )}
        </div>
      </div>

      {selectedTxIds.size > 0 && (<div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-40 flex items-center justify-between transition-transform transform-gpu animate-slide-up"> <span className="text-sm font-medium">{selectedTxIds.size} item(s) selected</span> <div className="flex items-center gap-4"> <CategorySelector id="bulk-category-selector" value="" onChange={handleBulkCategoryChange} className="bg-slate-700 text-white rounded-md p-2 text-sm focus:ring-primary" /> <button onClick={() => setSelectedTxIds(new Set())} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-semibold"> Deselect All </button> </div> </div>)}
      
      <Modal
        isOpen={isAnalysisResultModalOpen}
        onClose={() => setIsAnalysisResultModalOpen(false)}
        title="Analysis Complete"
      >
        <p className="text-sm text-slate-700">{analysisResultText}</p>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setIsAnalysisResultModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            OK
          </button>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Expense CSV Files"> <form onSubmit={handleImportSubmit} className="space-y-4"> <div> <label htmlFor="format-select" className="block text-sm font-medium text-slate-700">Select Import Format</label> <select id="format-select" value={selectedFormatId} onChange={(e) => setSelectedFormatId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white text-black"> {formats.map(f => ( <option key={f.id} value={f.id}>{f.name}</option> ))} </select> </div> <div> <label htmlFor="csvFiles" className="block text-sm font-medium text-slate-700">Choose CSV File(s)</label> <input type="file" id="csvFiles" name="csvFiles" multiple required accept=".csv,text/csv" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-sky-200" /> </div> <div className="flex justify-end space-x-3 pt-4"> <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm">Cancel</button> <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm">Import Files</button> </div> </form> </Modal>
    </>
  );
};

export default ExpensesView;