import { FormatConfig } from '../types';

// This array holds configurations for different CSV formats.
// It's designed to be easily extendable with new formats.
export const formats: FormatConfig[] = [
  {
    id: 'chase_bank',
    name: 'Chase Bank (Default)',
    columns: {
      transactionDate: 'Transaction Date',
      postDate: 'Post Date',
      description: 'Description',
      category: 'Category',
      type: 'Type',
      amount: 'Amount',
      memo: 'Memo',
    },
  },
  {
    id: 'amex',
    name: 'American Express',
    columns: {
      transactionDate: 'Date',
      description: 'Description',
      amount: 'Amount',
    },
    processRow: (row: Record<string, any>) => {
      const amount = parseFloat(row.amount);
      if (!isNaN(amount)) {
        // For Amex, credits are negative and debits (expenses) are positive.
        // We'll invert the amount so expenses become negative, matching the app's convention.
        row.amount = -amount;
        // Derive the 'Type' based on the original amount sign
        row.type = amount > 0 ? 'debit' : 'credit';
      }
      // Amex doesn't have these columns, so we provide defaults.
      row.postDate = row.transactionDate;
      row.category = 'Uncategorized';
      return row;
    },
  },
  {
    id: 'bank_of_america',
    name: 'Bank of America',
    dataStartIdentifier: 'Date,Description,Amount,Running Bal.',
    columns: {
      transactionDate: 'Date',
      description: 'Description',
      amount: 'Amount',
    },
    processRow: (row: Record<string, any>) => {
      // Handle BofA's amount format which can contain commas.
      const amountStr = (row.amount || '').replace(/,/g, '');
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) {
        // This will cause the main parser loop to skip this row (e.g., the "Beginning Balance" row).
        delete row.amount;
      } else {
        row.amount = amount;
        // BofA debits are negative, credits are positive. This aligns with our 'debit'/'credit' logic.
        row.type = amount < 0 ? 'debit' : 'credit';
      }
      
      // Provide default values for columns not present in the BofA CSV.
      row.postDate = row.transactionDate;
      row.category = 'Uncategorized';
      
      return row;
    },
  },
  // Add other formats here in the future
];