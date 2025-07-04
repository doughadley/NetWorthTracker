import { Institution, Account, Budget, ExpenseTransaction, HistoricalDataPoint, CategoryHierarchy, CategoryInclusionSettings } from '../types';

const INSTITUTIONS_KEY = 'netWorthTracker_institutions';
const ACCOUNTS_KEY = 'netWorthTracker_accounts';
const BUDGETS_KEY = 'netWorthTracker_budgets';
const EXPENSES_KEY = 'netWorthTracker_expenses';
const HISTORICAL_DATA_KEY = 'netWorthTracker_historicalData';
const CATEGORIES_KEY = 'netWorthTracker_categories';
const CATEGORY_INCLUSION_KEY = 'netWorthTracker_categoryInclusion';

const getStorageKey = (baseKey: string, userId: string | null): string => {
    if (!userId) {
        // Local-only mode. Use a generic key.
        return `${baseKey}_local_user`;
    }
    // Logged-in mode. Use a user-specific key.
    return `${baseKey}_${userId}`;
}

export const loadInstitutions = (userId: string | null): Institution[] => {
  const key = getStorageKey(INSTITUTIONS_KEY, userId);
  const data = localStorage.getItem(key);
  if (!data) {
    return []; // No data, start fresh for the session.
  }
  try {
    const parsedData = JSON.parse(data);
    if (Array.isArray(parsedData)) {
      // Data migration for institutions that don't have a 'type'
      const migratedData = parsedData.map((inst: any) => ({
        ...inst,
        type: inst.type || 'financial',
        assetValue: inst.assetValue || undefined,
        liabilityValue: inst.liabilityValue || undefined,
      }));
      return migratedData;
    }
    // Data is not an array, which is invalid.
    console.warn("Stored institutions data is not an array. Starting fresh for this session.");
    alert("Could not load your stored institutions. The data format is invalid, but it has not been overwritten. You may be able to recover it by inspecting browser storage.");
    return [];
  } catch (e) {
    console.error("Failed to parse institutions from localStorage, data may be corrupt. Starting fresh for this session.", e);
    alert("Could not load your stored institutions due to a parsing error. Your data may be corrupt, but it has not been overwritten.");
    return [];
  }
};

export const saveInstitutions = (institutions: Institution[], userId: string | null): void => {
  const key = getStorageKey(INSTITUTIONS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(institutions));
};

export const deleteInstitutions = (userId: string | null): void => {
    const key = getStorageKey(INSTITUTIONS_KEY, userId);
    localStorage.removeItem(key);
};

export const loadAccounts = (userId: string | null): Account[] => {
  const key = getStorageKey(ACCOUNTS_KEY, userId);
  const data = localStorage.getItem(key);
   if (!data) {
    return []; // No data, start fresh for the session.
   }
  try {
    const parsedData = JSON.parse(data);
    // Simple validation: check if the first account has the new structure.
    if (Array.isArray(parsedData) && (parsedData.length === 0 || 'stockHoldings' in parsedData[0])) {
       return parsedData;
    }
    console.warn("Stored accounts data appears to be in an old or invalid format. Starting fresh for this session.");
    alert("Could not load your stored accounts. The data format appears outdated or invalid, but it has not been overwritten. You may be able to recover it by inspecting browser storage.");
    return [];
  } catch(e) {
    console.error("Failed to parse accounts from localStorage, data may be corrupt. Starting fresh for this session.", e);
    alert("Could not load your stored accounts due to a parsing error. Your data may be corrupt, but it has not been overwritten.");
    return [];
  }
};

export const saveAccounts = (accounts: Account[], userId: string | null): void => {
  const key = getStorageKey(ACCOUNTS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(accounts));
};

export const deleteAccounts = (userId: string | null): void => {
    const key = getStorageKey(ACCOUNTS_KEY, userId);
    localStorage.removeItem(key);
};

export const loadBudgets = (userId: string | null): Budget[] => {
  const key = getStorageKey(BUDGETS_KEY, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse budgets from localStorage", e);
    return [];
  }
};

export const saveBudgets = (budgets: Budget[], userId: string | null): void => {
  const key = getStorageKey(BUDGETS_KEY, userId);
  localStorage.setItem(key, JSON.stringify(budgets));
};

export const deleteBudgets = (userId: string | null): void => {
    const key = getStorageKey(BUDGETS_KEY, userId);
    localStorage.removeItem(key);
};

export const loadExpenses = (userId: string | null): ExpenseTransaction[] => {
    const key = getStorageKey(EXPENSES_KEY, userId);
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse expenses from localStorage", e);
        return [];
    }
};

export const saveExpenses = (transactions: ExpenseTransaction[], userId: string | null): void => {
    const key = getStorageKey(EXPENSES_KEY, userId);
    localStorage.setItem(key, JSON.stringify(transactions));
};

export const deleteExpenses = (userId: string | null): void => {
    const key = getStorageKey(EXPENSES_KEY, userId);
    localStorage.removeItem(key);
};


export const loadHistoricalData = (userId: string | null): HistoricalDataPoint[] => {
  const key = getStorageKey(HISTORICAL_DATA_KEY, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse historical data from localStorage", e);
    return [];
  }
};

export const saveHistoricalData = (data: HistoricalDataPoint[], userId: string | null): void => {
  const key = getStorageKey(HISTORICAL_DATA_KEY, userId);
  localStorage.setItem(key, JSON.stringify(data));
};

export const deleteHistoricalData = (userId: string | null): void => {
    const key = getStorageKey(HISTORICAL_DATA_KEY, userId);
    localStorage.removeItem(key);
};

export const loadCategoryStructure = (userId: string | null): CategoryHierarchy => {
    const key = getStorageKey(CATEGORIES_KEY, userId);
    const data = localStorage.getItem(key);
    if (!data) return {};
    try {
        const parsed = JSON.parse(data);
        // Basic validation
        if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
            return parsed;
        }
        return {};
    } catch (e) {
        console.error("Failed to parse categories from localStorage", e);
        return {};
    }
};

export const saveCategoryStructure = (categories: CategoryHierarchy, userId: string | null): void => {
    const key = getStorageKey(CATEGORIES_KEY, userId);
    localStorage.setItem(key, JSON.stringify(categories));
};

export const deleteCategoryStructure = (userId: string | null): void => {
    const key = getStorageKey(CATEGORIES_KEY, userId);
    localStorage.removeItem(key);
};

export const loadCategoryInclusionSettings = (userId: string | null): CategoryInclusionSettings => {
    const key = getStorageKey(CATEGORY_INCLUSION_KEY, userId);
    const data = localStorage.getItem(key);
    if (!data) return {};
    try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
            return parsed;
        }
        return {};
    } catch (e) {
        console.error("Failed to parse category inclusion settings from localStorage", e);
        return {};
    }
};

export const saveCategoryInclusionSettings = (settings: CategoryInclusionSettings, userId: string | null): void => {
    const key = getStorageKey(CATEGORY_INCLUSION_KEY, userId);
    localStorage.setItem(key, JSON.stringify(settings));
};

export const deleteCategoryInclusionSettings = (userId: string | null): void => {
    const key = getStorageKey(CATEGORY_INCLUSION_KEY, userId);
    localStorage.removeItem(key);
};
