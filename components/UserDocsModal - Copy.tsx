import React from 'react';
import Modal from './Modal';
import { Marked } from 'marked';

interface UserDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const docsContent = `
## 1. Welcome to Net Worth Tracker!

This guide will walk you through the features of the application. The goal is to give you a powerful tool to understand and manage your complete financial picture, from high-level assets to individual expenses.

**Key Concept: Local-First Data**
Your financial data is private. By default, everything you enter is stored **only in your browser**. It is not sent to any server. You can optionally create an account to back up and sync your data across devices.

---

## 2. The Assets Tab: Your Financial Dashboard

This is your main overview. It shows your net worth and how your assets are allocated.

#### Adding Your Assets
1.  **Add an Asset/Institution**: Click **"Add Asset"**. You can add:
    *   **Financial Institution**: For things like banks and brokerages (e.g., Chase, Fidelity).
    *   **Real Estate Asset**: For things like your home. You can enter its estimated value and any outstanding mortgage balance.
2.  **Add an Account**: Once you have a financial institution, click **"Add Account"**.
    *   Select the institution it belongs to.
    *   Give it a name (e.g., "Everyday Checking", "401k").
    *   **Enter Balances**:
        *   **Cash Balance**: The liquid cash in the account.
        *   **Stock Holdings**: Click **"Add Stock"** and enter the Ticker Symbol, number of shares, and your average purchase price per share.
        *   **CD Holdings**: Click **"Add CD"** to add Certificates of Deposit.

#### Understanding the Dashboard
*   **Total Net Worth**: Your total assets minus your total liabilities (like mortgages).
*   **Year-to-Date**: How your net worth has changed since the beginning of the current year.
*   **Net Worth History**: A graph showing how your net worth has changed over time. This populates as you use the app day-to-day.
*   **Asset Allocation**: A chart showing how your assets are split between Stocks, Cash, CDs, and Real Estate.
*   **Top Movers**: Shows which of your stocks have had the biggest gains or losses in total value since you purchased them.

#### Keeping Data Fresh
*   Click **"Refresh Prices"** to fetch the latest market prices for all your stock holdings. The free API has daily limits, so use it when you need a snapshot. Your stock values and net worth will update automatically.

---

## 3. The Expenses Tab: Tracking Your Spending

This is where you can import, categorize, and analyze your transactions.

#### Importing Transactions
1.  Click the **"Import"** button.
2.  Select your bank's format from the dropdown (e.g., Chase, American Express).
3.  Choose the CSV file(s) you downloaded from your bank.
4.  Click **"Import Files"**. The app will automatically add new transactions and skip any duplicates.

#### Categorizing & Classifying
*   **Category**: Use the dropdown next to each transaction to assign it to a category. You can create new categories directly from this dropdown.
*   **Spending Type**: Use the second dropdown to classify spending as:
    *   **Non-Discretionary**: Needs (e.g., Rent, Utilities, Groceries).
    *   **Discretionary**: Wants (e.g., Restaurants, Hobbies).
    *   **One-Time**: Large, infrequent purchases (e.g., Vacation, a new appliance).
*   **Bulk Updates**:
    *   Check the boxes next to multiple transactions.
    *   A bar will appear at the bottom of the screen.
    *   Use the dropdowns in this bar to change the category or spending type for all selected items at once.

#### Interactive Dashboard & Filtering
The dashboard at the top provides a powerful way to analyze your spending for the selected month.
1.  **Select a Month**: Use the dropdown to choose which month's data to view.
2.  **Compare with Budget**: If you've created a budget, you can select it here to see how your spending compares.
3.  **Toggle View (Chart vs. Matrix)**:
    *   **Chart View**: A standard bar chart showing spending by category. If a budget is selected, it becomes a stacked chart showing what you've spent versus what you budgeted.
    *   **Matrix View**: This is a powerful table showing your spending broken down by **category (rows)** and **spending type (columns)**.
4.  **Drill Down with the Matrix**:
    *   **Click any cell** in the matrix to instantly filter the transaction list below.
    *   *Example*: Click the number in the "Food" row and "Discretionary" column to see only your restaurant/dining out expenses.
    *   Click a category name to see all transactions in that category.
    *   Click a column header (e.g., "Discretionary") to see all discretionary spending.
    *   A blue status bar will show your active filter. Click the "Clear Filter" button to return to the full list.

#### AI-Powered Analysis
*   Select a month using the dropdown next to the "Analyze" button.
*   Click **"Analyze"**. The Gemini AI will review your transactions for that month and highlight any potential anomalies (e.g., unusually large purchases, spending in a rare category). Highlighted items will have a warning icon with an explanation.

---

## 4. The Budget Tab: Planning Your Finances

Here you can create budgets based on your actual spending history.

1.  Click **"Create New Budget"**.
2.  Give your budget a name.
3.  **Select Months**: Choose the historical months you want to base the budget on. The app will calculate the average monthly spending from this period.
4.  **Select Categories**: Choose which categories to include in the budget.
5.  Click **"Create Budget"**.
6.  Your new budget will appear as a card. You can click on any value to edit it manually.

---

## 5. The Categories Tab: Organizing Your Spending

Manage the structure of your expense categories here.

*   **Hierarchy**: Categories have a Parent:Child structure (e.g., "Shopping:Clothing").
*   **Create**: Add new parent categories or sub-categories within a parent.
*   **Edit/Delete**: Click on a category name to edit it. Use the trash icon to delete it.
*   **Include in Totals**: The checkbox next to each category controls whether its expenses are included in the summary charts and totals on the Expenses tab. Uncheck categories like "Credit Card Payment" or "Income" to avoid double-counting.

---

## 6. The Data Tab: Managing Your Data

This is your hub for data management.

*   **Export/Import**: You can export all your "Assets Data" or "Expenses Data" as separate JSON files. This is a great way to create a full backup. You can import these files later to restore your data.
*   **Delete Data**: Use the "Delete" buttons to permanently erase all data for either Assets or Expenses. **This is irreversible**, so you will be asked to type "DELETE" to confirm.

---

## 7. Authentication

*   **Local Mode**: Without logging in, all data is saved on your device.
*   **Cloud Sync**: You can create an account or log in. When logged in, your data is securely saved to your account, allowing you to access it from different browsers or devices.
`;

const UserDocsModal: React.FC<UserDocsModalProps> = ({ isOpen, onClose }) => {

  const createMarkup = (markdownText: string) => {
    // Define a custom renderer object.
    const renderer = {
      heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        if (level === 2) {
          return `<h2 id="${escapedText}" class="text-2xl font-bold text-primary mt-6 mb-3 border-b-2 border-slate-200 pb-2">${text}</h2>`;
        }
        if (level === 3) {
          return `<h3 id="${escapedText}" class="text-xl font-semibold text-slate-800 mt-4 mb-2">${text}</h3>`;
        }
        if (level === 4) {
          return `<h4 id="${escapedText}" class="text-lg font-semibold text-slate-700 mt-3 mb-1">${text}</h4>`;
        }
        return `<h${level} id="${escapedText}" class="font-bold">${text}</h${level}>`;
      },
      paragraph(text: string) {
        return `<p class="mb-3 text-slate-700 leading-relaxed">${text}</p>`;
      },
      list(body: string, ordered: boolean) {
        const tag = ordered ? 'ol' : 'ul';
        const listClass = ordered ? 'list-decimal list-inside space-y-2' : 'list-disc list-inside space-y-2';
        return `<${tag} class="${listClass} mb-4">${body}</${tag}>`;
      },
      listitem(text: string) {
        return `<li class="pl-2">${text}</li>`;
      },
      strong(text: string) {
        return `<strong class="font-semibold text-slate-800">${text}</strong>`;
      },
      codespan(code: string) {
        return `<code class="bg-slate-200 text-slate-800 p-1 rounded text-xs font-mono">${code}</code>`;
      },
      hr() {
        return '<hr class="my-6 border-slate-200" />';
      }
    };
    
    // Create a new Marked instance with the custom renderer.
    const markedInstance = new Marked({ renderer });

    // Parse the markdown using the instance.
    const rawMarkup = markedInstance.parse(markdownText, { gfm: true, breaks: true });
    
    return { __html: rawMarkup as string };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Guide" maxWidth="max-w-4xl">
      <div className="max-h-[80vh] overflow-y-auto pr-4">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={createMarkup(docsContent)}
        />
      </div>
    </Modal>
  );
};

export default UserDocsModal;
