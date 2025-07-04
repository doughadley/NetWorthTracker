

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Institution, Account, StockHolding, StockPriceInfo, ExpenseTransaction, Budget, BudgetItem, HistoricalDataPoint, CategoryHierarchy, CategoryInclusionSettings, SpendingType } from './types';
import { 
    loadInstitutions, saveInstitutions, deleteInstitutions,
    loadAccounts, saveAccounts, deleteAccounts,
    loadExpenses, saveExpenses, deleteExpenses,
    loadBudgets, saveBudgets, deleteBudgets,
    loadHistoricalData, saveHistoricalData, deleteHistoricalData,
    loadCategoryStructure, saveCategoryStructure, deleteCategoryStructure,
    loadCategoryInclusionSettings, saveCategoryInclusionSettings, deleteCategoryInclusionSettings
} from './services/storageService';
import { onAuthChange, signUpWithEmail, signInWithEmail, logout, type User } from './services/firebaseService';
import { fetchStockPrices } from './services/stockApiService';
import { generateId } from './utils/idGenerator';
import { getBaseVendor } from './utils/vendorUtils';
import Modal from './components/Modal';
import InstitutionForm from './components/InstitutionForm';
import AccountForm from './components/AccountForm';
import AssetsView from './components/AssetsView';
import ExpensesView from './components/ExpensesView';
import BudgetView from './components/BudgetView';
import DataView from './components/DataView';
import CategoryView from './components/CategoryView';
import MassUpdateModal from './components/MassUpdateModal';
import AuthForm from './components/AuthForm';
import ChangelogModal from './components/ChangelogModal';
import UserDocsModal from './components/UserDocsModal';
import { parseCategory, buildCategoryHierarchy } from './utils/categoryUtils';
import PrintableBudgetReport from './components/PrintableBudgetReport';
import PrintableAssetsReport from './components/PrintableAssetsReport';
import PrintableExpenseReport from './components/PrintableExpenseReport';

type ActiveTab = 'assets' | 'expenses' | 'budget' | 'categories' | 'data';
type ImportType = 'assets' | 'expenses' | 'historical';
type AuthState = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
};
interface VersionInfo {
  currentVersion: string;
  changelog: { version: string; date: string; description: string }[];
}


const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null });
  const [activeTab, setActiveTab] = useState<ActiveTab>('assets');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [categoryStructure, setCategoryStructure] = useState<CategoryHierarchy>({});
  const [categoryInclusion, setCategoryInclusion] = useState<CategoryInclusionSettings>({});
  
  const [expandedInstitutions, setExpandedInstitutions] = useState<Set<string>>(new Set());
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [totalNetWorth, setTotalNetWorth] = useState<number>(0);
  const [ytdNetWorth, setYtdNetWorth] = useState<{ amount: number; percentage: number } | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(false);

  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState<boolean>(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [isMassUpdateModalOpen, setIsMassUpdateModalOpen] = useState<boolean>(false);
  const [massUpdateData, setMassUpdateData] = useState<{
    originalTx: ExpenseTransaction;
    similarTxs: ExpenseTransaction[];
    newCategory: string;
  } | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState<boolean>(false);
  const [isUserDocsModalOpen, setIsUserDocsModalOpen] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({ currentVersion: '', changelog: [] });


  const [importType, setImportType] = useState<ImportType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // Printing State
  const [printingBudget, setPrintingBudget] = useState<Budget | null>(null);
  const [isPrintingAssets, setIsPrintingAssets] = useState<boolean>(false);
  const [isAssetsReportReady, setIsAssetsReportReady] = useState<boolean>(false);
  const [isPrintingExpenses, setIsPrintingExpenses] = useState<boolean>(false);
  const [expenseReportData, setExpenseReportData] = useState<{ transactions: ExpenseTransaction[]; budget: Budget | null; month: string; } | null>(null);
  const [isExpenseReportReady, setIsExpenseReportReady] = useState<boolean>(false);


  // Fetch version info on mount
  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/version.json');
        const data = await response.json();
        setVersionInfo(data);
      } catch (error) {
        console.error("Failed to load version info:", error);
      }
    };
    fetchVersionInfo();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setAuthState({ status: 'authenticated', user });
      } else {
        setAuthState({ status: 'unauthenticated', user: null });
      }
    });
    return () => unsubscribe();
  }, []);

  // Load initial data from localStorage based on user (or local)
  useEffect(() => {
    if (authState.status === 'loading') {
        // Wait for auth state to resolve before loading data
        return;
    }
    const userId = authState.user?.uid || null;
    
    const loadedInstitutions = loadInstitutions(userId);
    const loadedAccounts = loadAccounts(userId);
    const loadedTransactions = loadExpenses(userId);
    const loadedBudgets = loadBudgets(userId);
    const loadedHistoricalData = loadHistoricalData(userId);
    const loadedCategories = loadCategoryStructure(userId);
    let loadedInclusionSettings = loadCategoryInclusionSettings(userId);

    setInstitutions(loadedInstitutions);
    setAccounts(loadedAccounts);
    setBudgets(loadedBudgets);
    setHistoricalData(loadedHistoricalData);
    setTransactions(loadedTransactions);

    // MIGRATION LOGIC: If no category structure is stored but transactions exist, build it.
    if (Object.keys(loadedCategories).length === 0 && loadedTransactions.length > 0) {
      console.log("No category structure found, migrating from existing transactions...");
      const initialStructure = buildCategoryHierarchy(loadedTransactions.map(t => t.category));
      setCategoryStructure(initialStructure);
    } else {
      setCategoryStructure(loadedCategories);
    }
    
    // MIGRATION for inclusion settings if they don't exist
    const allCategories = Object.entries(loadedCategories).flatMap(([parent, children]) => [parent, ...children.map(c => `${parent}:${c}`)]);
    const settingsAreMissing = allCategories.some(cat => loadedInclusionSettings[cat] === undefined);

    if (settingsAreMissing) {
      console.log("Category inclusion settings are missing or incomplete. Generating defaults...");
      const newSettings = { ...loadedInclusionSettings };
      allCategories.forEach(cat => {
        if(newSettings[cat] === undefined) {
          newSettings[cat] = true; // Default to included
        }
      });
      // Ensure special categories have correct defaults
      newSettings['Uncategorized'] = false;
      newSettings['Credit Card'] = false;
      loadedInclusionSettings = newSettings;
    }

    setCategoryInclusion(loadedInclusionSettings);
    setExpandedInstitutions(new Set(loadedInstitutions.map(i => i.id)));
  }, [authState]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => { if (authState.status !== 'loading') saveInstitutions(institutions, authState.user?.uid || null); }, [institutions, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveAccounts(accounts, authState.user?.uid || null); }, [accounts, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveExpenses(transactions, authState.user?.uid || null); }, [transactions, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveBudgets(budgets, authState.user?.uid || null); }, [budgets, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveHistoricalData(historicalData, authState.user?.uid || null); }, [historicalData, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveCategoryStructure(categoryStructure, authState.user?.uid || null); }, [categoryStructure, authState]);
  useEffect(() => { if (authState.status !== 'loading') saveCategoryInclusionSettings(categoryInclusion, authState.user?.uid || null); }, [categoryInclusion, authState]);


  const calculateAccountValue = useCallback((account: Account): number => {
    const stockValue = account.stockHoldings.reduce((sum, holding) => sum + holding.shares * holding.currentPrice, 0);
    const cdValue = account.cdHoldings.reduce((sum, cd) => sum + cd.principal, 0);
    return account.balance + stockValue + cdValue;
  }, []);
  
  useEffect(() => {
    const financialValue = accounts.reduce((sum, acc) => sum + calculateAccountValue(acc), 0);
    const realEstateNetValue = institutions
      .filter(inst => inst.type === 'real_estate')
      .reduce((sum, inst) => sum + ((inst.assetValue || 0) - (inst.liabilityValue || 0)), 0);
    setTotalNetWorth(financialValue + realEstateNetValue);
  }, [accounts, institutions, calculateAccountValue]);
  
  // Effect to capture historical data
  useEffect(() => {
    if (authState.status === 'loading') return;
    if (totalNetWorth === 0 && historicalData.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const newAccountValues = accounts.reduce((acc, account) => {
        acc[account.id] = calculateAccountValue(account);
        return acc;
    }, {} as Record<string, number>);

    setHistoricalData(prevData => {
        const lastDataPoint = prevData.length > 0 ? prevData[prevData.length - 1] : null;
        
        if (lastDataPoint && lastDataPoint.date === todayStr) {
            const updatedData = [...prevData.slice(0, -1)]; 
            updatedData.push({
                ...lastDataPoint,
                netWorth: totalNetWorth,
                accountValues: newAccountValues,
            });
            return updatedData;
        } else { 
            return [...prevData, {
                date: todayStr,
                netWorth: totalNetWorth,
                accountValues: newAccountValues,
            }];
        }
    });
  }, [totalNetWorth, accounts, calculateAccountValue, authState.status]); 
  
  // Effect to calculate YTD Net Worth
  useEffect(() => {
    if (historicalData.length < 1 || totalNetWorth === 0) {
      setYtdNetWorth(null);
      return;
    }

    const currentYear = new Date().getFullYear().toString();
    
    const sortedDataForYear = historicalData
        .filter(p => p.date.startsWith(currentYear))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (sortedDataForYear.length === 0) {
        setYtdNetWorth(null);
        return;
    }

    const firstDataPointOfTheYear = sortedDataForYear[0];
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (sortedDataForYear.length === 1 && firstDataPointOfTheYear.date === todayStr) {
      setYtdNetWorth(null);
      return;
    }
    
    if (firstDataPointOfTheYear.netWorth === 0) {
      setYtdNetWorth(null);
      return;
    }

    const startOfYearValue = firstDataPointOfTheYear.netWorth;
    const amount = totalNetWorth - startOfYearValue;
    const percentage = (amount / startOfYearValue) * 100;

    setYtdNetWorth({ amount, percentage });

  }, [historicalData, totalNetWorth]);


  const handleRefreshStockPrices = async () => {
    setIsLoadingPrices(true);
    const symbolsToFetch: string[] = [];
    accounts.forEach(acc => {
      acc.stockHoldings.forEach(h => {
        if (!symbolsToFetch.includes(h.symbol)) {
          symbolsToFetch.push(h.symbol);
        }
      });
    });

    if (symbolsToFetch.length === 0) {
      setIsLoadingPrices(false);
      return;
    }

    try {
      const fetchedPrices: StockPriceInfo[] = await fetchStockPrices(symbolsToFetch);
      const priceMap = new Map(fetchedPrices.map(p => [p.symbol, p.price]));

      setAccounts(prevAccounts => 
        prevAccounts.map(acc => ({
            ...acc,
            stockHoldings: acc.stockHoldings.map(h => ({
              ...h,
              currentPrice: priceMap.get(h.symbol) ?? h.currentPrice, 
            })),
          })
        )
      );
    } catch (error) {
      console.error("Failed to fetch stock prices:", error);
      alert("Error fetching stock prices. Please try again.");
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Institution Modal Handlers
  const openAddInstitutionModal = () => {
    setEditingInstitution(null);
    setIsInstitutionModalOpen(true);
  };
  const openEditInstitutionModal = (institution: Institution) => {
    setEditingInstitution(institution);
    setExpandedInstitutions(prev => new Set(prev).add(institution.id)); 
    setIsInstitutionModalOpen(true);
  };
  const closeInstitutionModal = () => setIsInstitutionModalOpen(false);

  const handleInstitutionSubmit = (institutionData: Institution) => {
    if (editingInstitution) { 
      setInstitutions(institutions.map(inst => inst.id === editingInstitution.id ? { ...inst, ...institutionData } : inst));
    } else { 
      const newInstitution = { ...institutionData, id: generateId() };
      setInstitutions([...institutions, newInstitution]);
      setExpandedInstitutions(prev => new Set(prev).add(newInstitution.id));
    }
    closeInstitutionModal();
  };

  const handleDeleteInstitution = (institutionId: string) => {
    const institution = institutions.find(inst => inst.id === institutionId);
    if (!institution) return;

    if (institution.type === 'financial' && accounts.some(acc => acc.institutionId === institutionId)) {
        alert("Cannot delete institution: it still has accounts associated with it. Please delete or reassign accounts first.");
        return;
    }
    setInstitutions(institutions.filter(inst => inst.id !== institutionId));
  };


  // Account Modal Handlers
  const openAddAccountModal = () => {
    const hasFinancialInstitutions = institutions.some(inst => inst.type === 'financial');
    if (!hasFinancialInstitutions) {
      alert("Please add a financial institution first before adding an account.");
      return;
    }
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };
  const openEditAccountModal = (account: Account) => {
    setEditingAccount(account);
    setExpandedAccounts(prev => new Set(prev).add(account.id)); 
    setIsAccountModalOpen(true);
  };
  const closeAccountModal = () => setIsAccountModalOpen(false);

  const handleAccountSubmit = (accountData: Account) => {
    if (editingAccount) { 
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...acc, ...accountData } : acc));
    } else { 
      const newAccount = { ...accountData, id: generateId() };
      setAccounts([...accounts, newAccount]);
      setExpandedAccounts(prev => new Set(prev).add(newAccount.id)); 
    }
    closeAccountModal();
  };
  
  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
        setAccounts(accounts.filter(acc => acc.id !== accountId));
    }
  };

  // Expand/Collapse Handlers
  const handleToggleInstitutionExpand = (institutionId: string) => {
    setExpandedInstitutions(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(institutionId)) {
        newExpanded.delete(institutionId);
      } else {
        newExpanded.add(institutionId);
      }
      return newExpanded;
    });
  };

  const handleToggleAccountExpand = (accountId: string) => {
    setExpandedAccounts(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(accountId)) {
        newExpanded.delete(accountId);
      } else {
        newExpanded.add(accountId);
      }
      return newExpanded;
    });
  };

  const handleExpandAllInstitutions = () => setExpandedInstitutions(new Set(institutions.map(i => i.id)));
  const handleCollapseAllInstitutions = () => setExpandedInstitutions(new Set());
  const handleExpandAllAccounts = () => {
    const allAccountIdsWithDetails = accounts
      .filter(acc => acc.balance > 0 || (acc.stockHoldings && acc.stockHoldings.length > 0) || (acc.cdHoldings && acc.cdHoldings.length > 0))
      .map(acc => acc.id);
    setExpandedAccounts(new Set(allAccountIdsWithDetails));
  };
  const handleCollapseAllAccounts = () => setExpandedAccounts(new Set());

  // Data Handlers
  const handleExportAssetsData = () => {
    const dataToExport = { institutions, accounts, historicalData };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `net-worth-tracker-assets-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExportExpensesData = () => {
    const dataToExport = { transactions, budgets, categoryStructure, categoryInclusion };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `net-worth-tracker-expenses-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleImportClick = (type: ImportType) => {
    setImportType(type);
    fileInputRef.current?.click();
  };
  
  const handleHistoricalDataImport = (csvText: string) => {
    try {
        const rows = csvText.trim().split('\n');
        if (rows.length < 2) throw new Error("CSV file must have a header and at least one data row.");

        const headerRowText = rows[0].trim();
        const headerColumns = headerRowText.toLowerCase().split(',').map(h => h.trim());

        // More flexible header matching
        const findIndex = (possibleNames: string[]) => possibleNames.reduce<number>((acc, name) => acc > -1 ? acc : headerColumns.indexOf(name), -1);

        const dateIndex = findIndex(['date']);
        const instIndex = findIndex(['institution name', 'institution']);
        const accIndex = findIndex(['account name', 'account']);
        const valueIndex = findIndex(['value']);

        if (dateIndex === -1 || instIndex === -1 || accIndex === -1 || valueIndex === -1) {
            throw new Error("Invalid CSV header. Header must contain columns for Date, Institution, Account, and Value.");
        }
        
        const parseCsvRow = (rowStr: string): string[] => {
            const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
            const matches = rowStr.match(regex) || [];
            return matches.map(field => field.replace(/^"|"$/g, '').trim());
        };
        
        const dataRows = rows.slice(1);
        
        const accountMap = new Map<string, Account>();
        accounts.forEach(acc => {
            const institution = institutions.find(inst => inst.id === acc.institutionId);
            if(institution) {
                const key = `${institution.name}|${acc.name}`;
                accountMap.set(key, acc);
            }
        });

        const dataToMerge: { date: string, accountId: string, value: number }[] = [];

        for (const row of dataRows) {
            const columns = parseCsvRow(row);
            if (columns.length < 4) continue;

            const dateStr = columns[dateIndex];
            const instName = columns[instIndex];
            const accName = columns[accIndex];
            const valueStr = columns[valueIndex];
            
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) {
                console.warn(`Skipping row with invalid date: "${dateStr}"`);
                continue;
            }
            const date = dateObj.toISOString().split('T')[0];
            const value = parseFloat(valueStr);

            if (!date || !instName || !accName || isNaN(value)) {
                console.warn('Skipping invalid historical data row:', row);
                continue;
            }

            const account = accountMap.get(`${instName}|${accName}`);
            if (!account) {
                console.warn(`Account not found for historical import row: ${instName} - ${accName}`);
                continue;
            }

            dataToMerge.push({ date, accountId: account.id, value });
        }
        
        if (dataToMerge.length === 0) {
            alert("No valid historical data points to import were found in the file.");
            return;
        }

        let updatedHistoricalData = [...historicalData];
        
        dataToMerge.forEach(item => {
            const existingPointIndex = updatedHistoricalData.findIndex(p => p.date === item.date);
            if (existingPointIndex > -1) {
                updatedHistoricalData[existingPointIndex].accountValues[item.accountId] = item.value;
            } else {
                const newPoint: HistoricalDataPoint = {
                    date: item.date,
                    netWorth: 0, 
                    accountValues: { [item.accountId]: item.value }
                };
                updatedHistoricalData.push(newPoint);
            }
        });
        
        const realEstateNetValue = institutions
            .filter(inst => inst.type === 'real_estate')
            .reduce((sum, inst) => sum + ((inst.assetValue || 0) - (inst.liabilityValue || 0)), 0);

        updatedHistoricalData = updatedHistoricalData.map(point => {
            const financialValue = Object.values(point.accountValues).reduce((sum, val) => sum + (val || 0), 0);
            return {
                ...point,
                netWorth: financialValue + realEstateNetValue
            };
        });

        updatedHistoricalData.sort((a,b) => a.date.localeCompare(b.date));

        setHistoricalData(updatedHistoricalData);
        alert(`Successfully imported and merged ${dataToMerge.length} historical data points.`);

    } catch (error) {
        console.error("Failed to import historical data:", error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !importType) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImportType(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");
        
        if (importType === 'historical') {
            handleHistoricalDataImport(text);
            return; // Exit after handling
        }

        const data = JSON.parse(text);

        if (importType === 'assets') {
          if (!data || !Array.isArray(data.institutions) || !Array.isArray(data.accounts) || !Array.isArray(data.historicalData)) {
            throw new Error("Invalid asset file format. The file must contain institutions, accounts, and historicalData arrays.");
          }
          if (window.confirm("This will overwrite your Assets, Accounts, and History data. Are you sure?")) {
            setInstitutions(data.institutions);
            setAccounts(data.accounts);
            setHistoricalData(data.historicalData);
            setExpandedInstitutions(new Set((data.institutions || []).map((i: Institution) => i.id)));
            setExpandedAccounts(new Set());
            alert("Assets & Accounts data imported successfully!");
          }
        } else if (importType === 'expenses') {
          if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.budgets) || typeof data.categoryStructure !== 'object') {
            throw new Error("Invalid expenses file format. The file must contain transactions, budgets, and a categoryStructure object.");
          }
          if (window.confirm("This will overwrite your Expenses, Budgets, and Categories data. Are you sure?")) {
            setTransactions(data.transactions);
            setBudgets(data.budgets);
            setCategoryStructure(data.categoryStructure);
            setCategoryInclusion(data.categoryInclusion || {});
            alert("Expenses & Budgets data imported successfully!");
          }
        }
      } catch (error) {
        console.error("Failed to import data:", error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setImportType(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAssetsData = () => {
    const userId = authState.user?.uid || null;
    deleteInstitutions(userId);
    deleteAccounts(userId);
    deleteHistoricalData(userId);

    // Reset state
    setInstitutions([]);
    setAccounts([]);
    setHistoricalData([]);
    setExpandedInstitutions(new Set());
    setExpandedAccounts(new Set());

    alert('All assets, accounts, and historical data have been deleted.');
  };

  const handleDeleteExpensesData = () => {
    const userId = authState.user?.uid || null;
    deleteExpenses(userId);
    deleteBudgets(userId);
    deleteCategoryStructure(userId);
    deleteCategoryInclusionSettings(userId);
    
    // Reset state
    setTransactions([]);
    setBudgets([]);
    setCategoryStructure({});
    setCategoryInclusion({});

    alert('All expenses, budgets, and category data have been deleted.');
  };

  const handleHistoricalDataUpdate = (newData: HistoricalDataPoint[]) => {
      setHistoricalData(newData);
  };

  const handleExportCategories = () => {
    const dataToExport = { categoryStructure, categoryInclusion };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `net-worth-tracker-categories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCategoriesClick = () => {
    categoryFileInputRef.current?.click();
  };

  const handleCategoryFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");
        const data = JSON.parse(text);

        if (typeof data.categoryStructure !== 'object' || typeof data.categoryInclusion !== 'object') {
          throw new Error("Invalid format. File must contain JSON object with 'categoryStructure' and 'categoryInclusion' keys.");
        }
        
        if (window.confirm("This will overwrite your current category structure. Are you sure?")) {
          setCategoryStructure(data.categoryStructure as CategoryHierarchy);
          setCategoryInclusion(data.categoryInclusion as CategoryInclusionSettings);
          alert("Category structure imported successfully!");
        }
      } catch (error) {
        console.error("Failed to import categories:", error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (categoryFileInputRef.current) categoryFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Expense and Budget Handlers
  const handleTransactionsImported = (newTransactions: ExpenseTransaction[]): { newCount: number, duplicateCount: number } => {
      const existingTxKeys = new Set(transactions.map(tx => 
          `${tx.transactionDate}|${tx.description.trim()}|${tx.amount.toFixed(2)}`
      ));

      const uniqueNewTransactions = newTransactions.filter(tx => {
          const key = `${tx.transactionDate}|${tx.description.trim()}|${tx.amount.toFixed(2)}`;
          return !existingTxKeys.has(key);
      });

      const duplicateCount = newTransactions.length - uniqueNewTransactions.length;

      if (uniqueNewTransactions.length > 0) {
        const existingCategories = new Set(Object.entries(categoryStructure).flatMap(([p,c]) => [p, ...c.map(child => `${p}:${child}`)]));
        const allNewCategoryStrings = [...new Set(uniqueNewTransactions.map(tx => tx.category))];
        const categoriesToAdd = allNewCategoryStrings.filter(cat => !existingCategories.has(cat));

        if (categoriesToAdd.length > 0) {
          console.log("Found new categories to add:", categoriesToAdd);
          let currentStructure = { ...categoryStructure };
          categoriesToAdd.forEach(catString => {
              const {parent, child} = parseCategory(catString);
              if (!currentStructure[parent]) {
                  currentStructure[parent] = [];
              }
              if(child && !currentStructure[parent].includes(child)) {
                  currentStructure[parent].push(child);
                  currentStructure[parent].sort();
              }
          });
          setCategoryStructure(currentStructure);
        }
        setTransactions(prev => [...prev, ...uniqueNewTransactions]);
      }
      
      return { newCount: uniqueNewTransactions.length, duplicateCount };
  };

  const handleUpdateTransactionCategory = (transactionId: string, newCategory: string) => {
    const transactionToUpdate = transactions.find(tx => tx.id === transactionId);
    if (!transactionToUpdate || !newCategory.trim()) return;

    const trimmedNewCategory = newCategory.trim();
    handleCreateCategory(trimmedNewCategory);
    const oldCategory = transactionToUpdate.category;
    const baseVendor = getBaseVendor(transactionToUpdate.description);

    const similarTransactions = transactions.filter(tx => 
        tx.id !== transactionId &&
        getBaseVendor(tx.description) === baseVendor &&
        tx.category === oldCategory
    );

    if (similarTransactions.length > 0) {
        setMassUpdateData({
            originalTx: transactionToUpdate,
            similarTxs: similarTransactions,
            newCategory: trimmedNewCategory,
        });
        setIsMassUpdateModalOpen(true);
    } else {
        setTransactions(prev => prev.map(tx =>
            tx.id === transactionId ? { ...tx, category: trimmedNewCategory } : tx
        ));
    }
  };

  const handleUpdateTransactionSpendingType = (transactionId: string, spendingType: SpendingType) => {
    setTransactions(prev =>
        prev.map(tx =>
            tx.id === transactionId ? { ...tx, spendingType } : tx
        )
    );
  };

  const handleMassCategoryUpdate = (transactionIds: string[], newCategory: string) => {
    setTransactions(prev => prev.map(tx =>
        transactionIds.includes(tx.id) ? { ...tx, category: newCategory } : tx
    ));
    setIsMassUpdateModalOpen(false);
    setMassUpdateData(null);
  };

  const handleMassSpendingTypeUpdate = (transactionIds: string[], spendingType: SpendingType) => {
    setTransactions(prev =>
        prev.map(tx =>
            transactionIds.includes(tx.id) ? { ...tx, spendingType } : tx
        )
    );
  };

  const handleCloseMassUpdateModal = () => {
    setIsMassUpdateModalOpen(false);
    setMassUpdateData(null);
  };

  const handleAddBudget = (name: string, selectedMonths: string[], selectedCategories: string[]) => {
      if (!name.trim()) {
        alert("Budget name cannot be empty.");
        return;
      }
      if (budgets.some(b => b.name.toLowerCase() === name.trim().toLowerCase())) {
        alert("A budget with this name already exists.");
        return;
      }
      if (selectedMonths.length === 0) {
          alert("Please select at least one month to include in the budget calculation.");
          return;
      }
      if (selectedCategories.length === 0) {
          alert("Please select at least one category to include in the budget.");
          return;
      }

      const expenseTypes = ['debit', 'sale'];
      const getMonthKey = (dateString: string) => {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return null;
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      };

      const relevantTransactions = transactions.filter(tx => {
        const monthKey = getMonthKey(tx.transactionDate);
        if (!monthKey || !selectedMonths.includes(monthKey) || !expenseTypes.includes(tx.type.toLowerCase())) {
          return false;
        }
        const category = tx.category || 'Uncategorized';
        return selectedCategories.some(sc => category === sc || category.startsWith(`${sc}:`));
      });


      if (relevantTransactions.length === 0) {
          alert("No expenses found for the selected criteria to create a budget from.");
          return;
      }
      
      const categoryTotals: Record<string, number> = {};
      selectedCategories.forEach(sc => {
        const totalForCategory = relevantTransactions
          .filter(tx => {
            const category = tx.category || 'Uncategorized';
            return category === sc || category.startsWith(`${sc}:`);
          })
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        categoryTotals[sc] = totalForCategory;
      });

      const monthCount = selectedMonths.length;
      const budgetItems: BudgetItem[] = Object.entries(categoryTotals).map(([category, total]) => ({
        category,
        amount: total / monthCount
      })).sort((a,b) => b.amount - a.amount);

      const newBudget: Budget = {
        id: generateId(),
        name: name.trim(),
        items: budgetItems
      };
      
      setBudgets(prev => [...prev, newBudget]);
  };

  const handleDeleteBudget = (budgetId: string) => {
      if (window.confirm("Are you sure you want to delete this budget?")) {
          setBudgets(budgets.filter(b => b.id !== budgetId));
      }
  };

  const handleUpdateBudgetItem = (budgetId: string, category: string, newAmount: number) => {
    setBudgets(prevBudgets => 
        prevBudgets.map(budget => {
            if (budget.id === budgetId) {
                const updatedItems = budget.items.map(item => {
                    if (item.category === category) {
                        return { ...item, amount: newAmount };
                    }
                    return item;
                });
                return { ...budget, items: updatedItems };
            }
            return budget;
        })
    );
  };

  // --- Printing Handlers ---

  const handlePrintBudget = (budgetId: string) => {
    const budgetToPrint = budgets.find(b => b.id === budgetId);
    if (budgetToPrint) {
        setPrintingBudget(budgetToPrint);
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => { setPrintingBudget(null); };
    if (printingBudget) {
        window.addEventListener('afterprint', handleAfterPrint);
        window.print();
    }
    return () => { window.removeEventListener('afterprint', handleAfterPrint); };
  }, [printingBudget]);

  const handlePrintAssetsReport = () => {
    setIsPrintingAssets(true);
  };

  const handleAssetsReportReady = () => {
    setIsAssetsReportReady(true);
  };

  useEffect(() => {
    if (!isPrintingAssets || !isAssetsReportReady) return;
    const handleAfterPrint = () => { setIsPrintingAssets(false); setIsAssetsReportReady(false); };
    window.addEventListener('afterprint', handleAfterPrint, { once: true });
    window.print();
    return () => { window.removeEventListener('afterprint', handleAfterPrint); };
  }, [isPrintingAssets, isAssetsReportReady]);
  
  const handlePrintExpenseReport = (transactionsForMonth: ExpenseTransaction[], selectedBudget: Budget | null, selectedMonth: string) => {
    setExpenseReportData({
        transactions: transactionsForMonth,
        budget: selectedBudget,
        month: selectedMonth
    });
    setIsPrintingExpenses(true);
  };

  const handleExpenseReportReady = () => {
    setIsExpenseReportReady(true);
  };

  useEffect(() => {
    if (!isPrintingExpenses || !isExpenseReportReady) return;
    const handleAfterPrint = () => {
        setIsPrintingExpenses(false);
        setExpenseReportData(null);
        setIsExpenseReportReady(false);
    };
    window.addEventListener('afterprint', handleAfterPrint, { once: true });
    window.print();
    return () => { window.removeEventListener('afterprint', handleAfterPrint); };
  }, [isPrintingExpenses, isExpenseReportReady]);


  // Category Management Handlers
  const handleCreateCategory = (name: string) => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const { parent, child } = parseCategory(trimmedName);
    setCategoryStructure(prev => {
      const newStructure = { ...prev };
      let needsUpdate = false;
      if (!newStructure[parent]) {
        newStructure[parent] = [];
        needsUpdate = true;
      }
      if (child && !newStructure[parent].includes(child)) {
        newStructure[parent].push(child);
        newStructure[parent].sort();
        needsUpdate = true;
      }
      return needsUpdate ? newStructure : prev;
    });
    // Sync inclusion settings
    setCategoryInclusion(prev => {
        const newSettings = {...prev};
        let needsUpdate = false;
        if (newSettings[parent] === undefined) {
            newSettings[parent] = true; // default to true
            needsUpdate = true;
        }
        if (child && newSettings[trimmedName] === undefined) {
            newSettings[trimmedName] = true;
            needsUpdate = true;
        }
        return needsUpdate ? newSettings : prev;
    });
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    setCategoryStructure(prev => {
        const newStructure = JSON.parse(JSON.stringify(prev));
        const {parent: oldParent, child: oldChild} = parseCategory(oldName);
        const {parent: newParent, child: newChild} = parseCategory(newName);

        if (oldChild === null && newChild === null) { 
            if (newParent !== oldParent && !newStructure[newParent]) {
                newStructure[newParent] = newStructure[oldParent];
                delete newStructure[oldParent];
            }
        } else if (oldChild && newChild) { 
            if (oldParent === newParent) {
                const childIndex = newStructure[oldParent]?.indexOf(oldChild);
                if (childIndex > -1) {
                    newStructure[oldParent][childIndex] = newChild;
                    newStructure[oldParent].sort();
                }
            }
        }
        return newStructure;
    });
    setTransactions(prev => prev.map(tx => {
        if (tx.category === oldName) {
            return { ...tx, category: newName };
        }
        if (tx.category.startsWith(`${oldName}:`)) {
            return { ...tx, category: tx.category.replace(`${oldName}:`, `${newName}:`) };
        }
        return tx;
    }));
    
    setBudgets(prev => prev.map(budget => ({
        ...budget,
        items: budget.items.map(item => {
            if (item.category === oldName) {
                return { ...item, category: newName };
            }
            if (item.category.startsWith(`${oldName}:`)) {
                return { ...item, category: item.category.replace(`${oldName}:`, `${newName}:`) };
            }
            return item;
        })
    })));

    setCategoryInclusion(prev => {
        const newSettings = { ...prev };
        const setting = newSettings[oldName] ?? true;
        delete newSettings[oldName];
        newSettings[newName] = setting;

        if (!oldName.includes(':')) { // Renaming a parent
            Object.keys(newSettings).forEach(key => {
                if(key.startsWith(`${oldName}:`)){
                    const newKey = key.replace(`${oldName}:`, `${newName}:`);
                    newSettings[newKey] = newSettings[key];
                    delete newSettings[key];
                }
            });
        }
        return newSettings;
    });
  };
  
  const handleDeleteCategory = (categoryToDelete: string) => {
    const { parent, child } = parseCategory(categoryToDelete);
    const isParentCategory = child === null;
    
    if (isParentCategory) {
        if (!window.confirm(`Are you sure you want to delete the parent category "${parent}"? This will also delete all its sub-categories and reassign all associated transactions to 'Uncategorized'.`)) return;

        setCategoryStructure(prev => {
            const newStructure = { ...prev };
            delete newStructure[parent];
            return newStructure;
        });
        
        setTransactions(prev => prev.map(tx => tx.category.startsWith(parent) ? { ...tx, category: 'Uncategorized' } : tx));
        setBudgets(prev => prev.map(budget => ({
            ...budget,
            items: budget.items.filter(item => !item.category.startsWith(parent))
        })));

    } else { 
        if (!window.confirm(`Are you sure you want to delete the sub-category "${child}"? Its transactions will be moved to the parent category "${parent}".`)) return;

        setCategoryStructure(prev => {
            const newStructure = { ...prev };
            if(newStructure[parent]) {
                newStructure[parent] = newStructure[parent].filter(c => c !== child);
            }
            return newStructure;
        });
        setTransactions(prev => prev.map(tx => tx.category === categoryToDelete ? { ...tx, category: parent } : tx));
        setBudgets(prev => prev.map(budget => ({
            ...budget,
            items: budget.items.filter(item => item.category !== categoryToDelete)
        })));
    }

    setCategoryInclusion(prev => {
        const newSettings = { ...prev };
        delete newSettings[categoryToDelete];
        if (isParentCategory) {
            Object.keys(newSettings).forEach(key => {
                if (key.startsWith(`${categoryToDelete}:`)) {
                    delete newSettings[key];
                }
            });
        }
        return newSettings;
    });
  };

  const handleSetCategoryInclusion = (categoryName: string, include: boolean) => {
    setCategoryInclusion(prev => ({ ...prev, [categoryName]: include }));
  };
  
  const TabButton = ({ tab, children }: { tab: ActiveTab, children: React.ReactNode }) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
          activeTab === tab
            ? 'bg-slate-100 text-primary'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        {children}
      </button>
  );
  
  const renderContent = () => {
    if (authState.status === 'loading') {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">Loading Application...</p>
        </div>
      );
    }
    
    // Authenticated or Unauthenticated, content is the same.
    switch (activeTab) {
      case 'assets':
        return (
          <AssetsView
            totalNetWorth={totalNetWorth}
            ytdNetWorth={ytdNetWorth}
            isLoadingPrices={isLoadingPrices}
            institutions={institutions}
            accounts={accounts}
            historicalData={historicalData}
            expandedInstitutions={expandedInstitutions}
            expandedAccounts={expandedAccounts}
            onOpenAddInstitutionModal={openAddInstitutionModal}
            onOpenEditInstitutionModal={openEditInstitutionModal}
            onDeleteInstitution={handleDeleteInstitution}
            onOpenAddAccountModal={openAddAccountModal}
            onOpenEditAccountModal={openEditAccountModal}
            onDeleteAccount={handleDeleteAccount}
            onRefreshStockPrices={handleRefreshStockPrices}
            onToggleInstitutionExpand={handleToggleInstitutionExpand}
            onToggleAccountExpand={handleToggleAccountExpand}
            onExpandAllInstitutions={handleExpandAllInstitutions}
            onCollapseAllInstitutions={handleCollapseAllInstitutions}
            onExpandAllAccounts={handleExpandAllAccounts}
            onCollapseAllAccounts={handleCollapseAllAccounts}
            calculateAccountValue={calculateAccountValue}
            onExportAssetsData={handleExportAssetsData}
            onImportAssetsClick={() => handleImportClick('assets')}
            onPrintAssetsReport={handlePrintAssetsReport}
          />
        );
      case 'expenses':
        return <ExpensesView transactions={transactions} onTransactionsImported={handleTransactionsImported} budgets={budgets} onUpdateTransactionCategory={handleUpdateTransactionCategory} onUpdateTransactionSpendingType={handleUpdateTransactionSpendingType} onMassUpdateCategory={handleMassCategoryUpdate} onMassUpdateSpendingType={handleMassSpendingTypeUpdate} categoryStructure={categoryStructure} categoryInclusion={categoryInclusion} onPrintExpenseReport={handlePrintExpenseReport} />;
      case 'budget':
        return <BudgetView transactions={transactions} budgets={budgets} onAddBudget={handleAddBudget} onDeleteBudget={handleDeleteBudget} onUpdateBudgetItem={handleUpdateBudgetItem} categoryStructure={categoryStructure} onPrintBudget={handlePrintBudget} />;
      case 'categories':
        return (
          <CategoryView 
            categoryStructure={categoryStructure}
            categoryInclusion={categoryInclusion}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onSetCategoryInclusion={handleSetCategoryInclusion}
            onExport={handleExportCategories}
            onImportClick={handleImportCategoriesClick}
          />
        );
      case 'data':
        return (
          <DataView
            historicalData={historicalData}
            onHistoricalDataUpdate={handleHistoricalDataUpdate}
            onExportAssetsData={handleExportAssetsData}
            onImportAssetsClick={() => handleImportClick('assets')}
            onExportExpensesData={handleExportExpensesData}
            onImportExpensesClick={() => handleImportClick('expenses')}
            onImportHistoricalClick={() => handleImportClick('historical')}
            onDeleteAssetsData={handleDeleteAssetsData}
            onDeleteExpensesData={handleDeleteExpensesData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {printingBudget && <PrintableBudgetReport budget={printingBudget} />}
      {isPrintingAssets && (
        <PrintableAssetsReport
          totalNetWorth={totalNetWorth}
          ytdNetWorth={ytdNetWorth}
          institutions={institutions}
          accounts={accounts}
          historicalData={historicalData}
          calculateAccountValue={calculateAccountValue}
          onReady={handleAssetsReportReady}
        />
      )}
      {isPrintingExpenses && expenseReportData && (
        <PrintableExpenseReport
            month={expenseReportData.month}
            transactions={expenseReportData.transactions}
            budget={expenseReportData.budget}
            onReady={handleExpenseReportReady}
        />
      )}
      <div className={printingBudget || isPrintingAssets || isPrintingExpenses ? 'no-print' : ''}>
        <header className="bg-primary text-white shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">Net Worth Tracker</h1>
                  <div>
                    {authState.status === 'authenticated' && authState.user ? (
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium hidden sm:block">{authState.user.displayName || authState.user.email}</span>
                        {authState.user.photoURL && (
                            <img src={authState.user.photoURL} alt="profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                        )}
                        <button onClick={logout} className="px-3 py-1.5 text-sm bg-sky-700 hover:bg-sky-800 rounded-md transition-colors">Logout</button>
                      </div>
                    ) : authState.status === 'unauthenticated' && (
                        <button onClick={() => setIsAuthModalOpen(true)} className="px-3 py-1.5 text-sm bg-sky-700 hover:bg-sky-800 rounded-md transition-colors">Login / Sign Up</button>
                    )}
                  </div>
              </div>
              {authState.status !== 'loading' && (
                 <nav className="flex space-x-1">
                    <TabButton tab="assets">Assets</TabButton>
                    <TabButton tab="expenses">Expenses</TabButton>
                    <TabButton tab="budget">Budget</TabButton>
                    <TabButton tab="categories">Categories</TabButton>
                    <TabButton tab="data">Data</TabButton>
                </nav>
              )}
          </div>
        </header>
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
           {renderContent()}
        </main>

        <Modal isOpen={isInstitutionModalOpen} onClose={closeInstitutionModal} title={editingInstitution ? 'Edit Asset' : 'Add New Asset'}>
          <InstitutionForm 
            onSubmit={handleInstitutionSubmit} 
            onCancel={closeInstitutionModal} 
            initialData={editingInstitution} 
          />
        </Modal>

        <Modal isOpen={isAccountModalOpen} onClose={closeAccountModal} title={editingAccount ? 'Edit Account' : 'Add New Account'}>
          <AccountForm 
            institutions={institutions}
            onSubmit={handleAccountSubmit} 
            onCancel={closeAccountModal} 
            initialData={editingAccount}
          />
        </Modal>
        
        <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} title="Login or Sign Up">
            <AuthForm
                onLogin={async (email, pass) => {
                    const result = await signInWithEmail(email, pass);
                    if (result.success) {
                        setIsAuthModalOpen(false);
                    }
                    return result;
                }}
                onRegister={async (email, pass, name) => {
                    const result = await signUpWithEmail(email, pass, name);
                    if (result.success) {
                        setIsAuthModalOpen(false);
                    }
                    return result;
                }}
            />
        </Modal>
        
        <ChangelogModal
            isOpen={isChangelogModalOpen}
            onClose={() => setIsChangelogModalOpen(false)}
            changelog={versionInfo.changelog}
        />

        <UserDocsModal
            isOpen={isUserDocsModalOpen}
            onClose={() => setIsUserDocsModalOpen(false)}
        />

        <MassUpdateModal
          isOpen={isMassUpdateModalOpen}
          onClose={handleCloseMassUpdateModal}
          onConfirm={handleMassCategoryUpdate}
          data={massUpdateData}
        />
        
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json,.csv"
        />

        <input
            type="file"
            ref={categoryFileInputRef}
            onChange={handleCategoryFileChange}
            className="hidden"
            accept="application/json"
        />

        <footer className="text-center py-4 mt-8 border-t border-slate-300">
            <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Net Worth Tracker.
                <button
                    onClick={() => setIsUserDocsModalOpen(true)}
                    className="ml-4 text-primary hover:underline focus:outline-none"
                    aria-label="View user documentation"
                >
                    User Docs
                </button>
                {versionInfo.currentVersion && (
                    <button 
                        onClick={() => setIsChangelogModalOpen(true)}
                        className="ml-4 text-primary hover:underline focus:outline-none"
                        aria-label="View changelog"
                    >
                        v{versionInfo.currentVersion}
                    </button>
                )}
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
