
export type SpendingType = 'non-discretionary' | 'discretionary' | 'one-time';

export interface StockHolding {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number; 
  currentPrice: number; 
}

export interface CDHolding {
  id: string;
  principal: number;
  interestRate: number; // Stored as a percentage, e.g., 5.5 for 5.5%
  openDate: string; // ISO date string (YYYY-MM-DD)
  maturityDate: string; // ISO date string (YYYY-MM-DD)
}

export interface Account {
  id: string;
  institutionId: string;
  name: string;
  /** Represents the cash portion of the account */
  balance: number; 
  stockHoldings: StockHolding[];
  cdHoldings: CDHolding[];
}

export type InstitutionType = 'financial' | 'real_estate';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  assetValue?: number; // e.g., House Value
  liabilityValue?: number; // e.g., Mortgage Balance
}

export interface StockPriceInfo {
  symbol: string;
  price: number;
}

export interface ExpenseTransaction {
  id: string;
  transactionDate: string;
  postDate: string;
  description: string;
  /** Can be a flat category or hierarchical, e.g., "Food:Groceries" */
  category: string;
  type: string;
  amount: number;
  memo: string;
  spendingType?: SpendingType;
}

export interface BudgetItem {
  category: string;
  amount: number;
}

export interface Budget {
  id: string;
  name: string;
  items: BudgetItem[];
}

export interface ColumnMapping {
  transactionDate: string;
  postDate?: string;
  description: string;
  category?: string;
  type?: string;
  amount: string;
  memo?: string;
}

export interface FormatConfig {
  id: string;
  name: string;
  columns: ColumnMapping;
  dataStartIdentifier?: string; // A string that identifies the header row, e.g., "Date,Description,Amount"
  // `processRow` allows for custom logic, like deriving types or inverting amounts.
  // It receives a raw object with keys from our internal ColumnMapping, and values from the CSV.
  processRow?: (row: Record<string, any>) => Record<string, any>;
}

export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  netWorth: number;
  accountValues: Record<string, number>; // { [accountId]: value }
}

export type CategoryHierarchy = Record<string, string[]>; // { [parent]: child[] }
export type CategoryInclusionSettings = Record<string, boolean>; // { [fullCategoryName]: includeInTotal }

// Add type declarations for environment variables accessed via import.meta.env.
// This allows accessing them with type safety in a Vite project.
// Assumes the environment is configured with these variables.
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_ALPHA_VANTAGE_API_KEY: string;
    // Firebase Environment Variables
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}