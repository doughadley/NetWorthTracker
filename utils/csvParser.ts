import { ExpenseTransaction, FormatConfig } from '../types';
import { generateId } from './idGenerator';

// A simple regex to parse a CSV row, handling quoted fields.
const parseCsvRow = (rowStr: string): string[] => {
  // This regex handles fields enclosed in double quotes, which may contain commas.
  const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
  const matches = rowStr.match(regex) || [];
  // Remove quotes from matched fields and trim whitespace.
  return matches.map(field => field.replace(/^"|"$/g, '').trim());
};

export const parseCsv = (
  csvText: string,
  config: FormatConfig
): ExpenseTransaction[] => {
  const allRows = csvText.trim().split('\n').filter(row => row.trim() !== '');
  
  let headerRowIndex = 0;
  if (config.dataStartIdentifier) {
      const foundIndex = allRows.findIndex(row => row.trim().startsWith(config.dataStartIdentifier!));
      if (foundIndex === -1) {
          throw new Error(`Could not find the data start identifier "${config.dataStartIdentifier}" in the file. Check if the correct format is selected.`);
      }
      headerRowIndex = foundIndex;
  }
  
  if (allRows.length < headerRowIndex + 2) {
    throw new Error("CSV must have a header and at least one data row after the start identifier.");
  }

  const headerRowText = allRows[headerRowIndex];
  const dataRows = allRows.slice(headerRowIndex + 1);
  
  const headerRow = parseCsvRow(headerRowText).map(h => h.trim().toLowerCase());
  const columnMapping = config.columns;

  // Map our internal keys (e.g., 'transactionDate') to the column index in the CSV.
  const headerIndices: { [key: string]: number } = {};
  
  for (const key in columnMapping) {
      const expectedHeader = (columnMapping as any)[key];
      if (expectedHeader) {
          const index = headerRow.findIndex(h => h === expectedHeader.toLowerCase());
          if (index !== -1) {
              (headerIndices as any)[key] = index;
          }
      }
  }

  // Check for mandatory columns for any format
  const requiredKeys = ['transactionDate', 'description', 'amount'];
  const missingRequired = requiredKeys.filter(key => (columnMapping as any)[key] && (headerIndices as any)[key] === undefined);
  
  if (missingRequired.length > 0) {
    const missingHeaders = missingRequired.map(key => (columnMapping as any)[key]);
    throw new Error(`Missing required CSV headers for format "${config.name}": ${missingHeaders.join(', ')}`);
  }

  const transactions: ExpenseTransaction[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowData = parseCsvRow(dataRows[i]);
    
    // Skip empty rows that might be parsed
    if (rowData.length === 0 || (rowData.length === 1 && rowData[0] === '')) {
        continue;
    }
    
    // Build a raw object based on our internal keys
    let rawTx: Record<string, any> = {};
    for (const key in headerIndices) {
        const index = (headerIndices as any)[key];
        if(index < rowData.length) {
            rawTx[key] = rowData[index];
        }
    }
    
    // Apply custom processing logic if the format requires it
    if (config.processRow) {
        rawTx = config.processRow(rawTx);
    }

    const amountNum = parseFloat(rawTx.amount);
    // Skip rows that are malformed or lack essential data
    if (isNaN(amountNum) || !rawTx.transactionDate) {
        console.warn("Skipping invalid or incomplete row:", dataRows[i]);
        continue;
    }

    transactions.push({
      id: generateId(),
      transactionDate: rawTx.transactionDate,
      postDate: rawTx.postDate || rawTx.transactionDate, // Fallback postDate
      description: rawTx.description,
      category: rawTx.category || 'Uncategorized', // Fallback category
      type: rawTx.type || (amountNum < 0 ? 'debit' : 'credit'), // Fallback type
      amount: amountNum,
      memo: rawTx.memo || '', // Fallback memo
    });
  }

  return transactions;
};