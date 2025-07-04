# Product Requirements Document: Net Worth Tracker

**Version:** 1.0
**Date:** July 4, 2024
**Author:** Gemini AI

### 1. Introduction & Overview

The Net Worth Tracker is a comprehensive personal finance web application designed for users who want to actively manage their financial health. It provides a consolidated view of a user's assets and liabilities, detailed expense tracking, and robust budgeting tools.

The application is built as a local-first, offline-capable Single Page Application (SPA). It prioritizes user privacy by storing all data in the browser's local storage by default, with optional cloud synchronization and user management provided by Firebase Authentication. Key features include live stock price updates, AI-powered expense analysis, data import/export capabilities, and printable reports.

### 2. Goals & Objectives

*   **Primary Goal:** To provide users with a single, clear, and powerful platform to understand and manage their complete financial picture.
*   **User Empowerment:** Enable users to make informed financial decisions through data visualization and actionable insights.
*   **Data Privacy & Control:** Ensure users have full ownership of their data with local-first storage and transparent export options.
*   **Modern UX:** Deliver a clean, responsive, and intuitive user experience that simplifies complex financial tracking.
*   **Extensibility:** Build a flexible platform that can be extended with new financial formats, asset types, and features.

### 3. Target Audience

The application is designed for financially-aware individuals who are comfortable using digital tools to manage their money. This includes:

*   Investors who want to track their portfolio alongside their cash accounts.
*   Budget-conscious individuals who need to track and categorize spending.
*   Homeowners who wish to track their real estate equity as part of their net worth.
*   Users who value data privacy and prefer to manage their data locally.

### 4. Core Features

The application is organized into several distinct tabs, each catering to a different aspect of personal finance management.

#### 4.1 Assets Tab
This is the main dashboard, providing a high-level overview of the user's net worth.
*   **Summary KPIs:** Displays Total Net Worth and Year-to-Date (YTD) change (both absolute and percentage).
*   **Net Worth History Graph:** A line chart visualizing the change in total net worth over time.
*   **Asset Allocation Chart:** A doughnut chart breaking down the user's assets into Stocks, Cash, CDs, and Real Estate.
*   **Top Movers Widget:** Shows the top 3 stock holdings with the highest total gains and losses since purchase.
*   **Institution & Account Management:**
    *   Users can add, edit, and delete **Institutions**, which can be either "Financial" (e.g., banks, brokerages) or "Real Estate" assets.
    *   Users can add, edit, and delete **Accounts** within financial institutions.
    *   Accounts can contain a cash balance, stock holdings, and CD holdings.
*   **Live Stock Data:** A "Refresh Prices" button fetches current market prices for all stock holdings using the Alpha Vantage API.
*   **Data Portability:** Users can export and import all asset-related data (Institutions, Accounts, History) as a JSON file.
*   **Printable Report:** Generates a clean, print-friendly summary of all assets, KPIs, and charts.

#### 4.2 Expenses Tab
This tab focuses on tracking and analyzing spending habits.
*   **CSV Import:** Users can import transaction history from multiple CSV files, with pre-configured formats for Chase, American Express, and Bank of America.
*   **AI-Powered Anomaly Detection:** Utilizes the Google Gemini API to analyze a selected month's transactions and highlight potential anomalies, such as unusually large purchases or spending in rare categories.
*   **Dynamic Monthly Dashboard:**
    *   A dropdown allows users to view data for any month with recorded transactions.
    *   Displays total spending for the selected month and compares it to the previous month.
    *   A "Spending by Category" bar chart visualizes where money was spent.
    *   If a budget is selected for comparison, the chart becomes a stacked bar chart showing money spent within budget, overspending, and budget remaining.
*   **Transaction List:**
    *   Transactions are grouped by month, then by parent category and sub-category.
    *   Supports searching, bulk selection, and re-categorization.
    *   Smart re-categorization prompts the user to update other similar transactions.

#### 4.3 Budget Tab
This tab allows users to create and monitor budgets.
*   **Budget Creation:** Users can automatically generate a budget based on the average spending from selected historical months and categories.
*   **Budget Viewing:** Budgets are displayed as cards, showing the total budgeted amount and a per-category breakdown.
*   **Editable Values:** Individual budget line items are editable directly in the view.
*   **Printable Report:** Generates a formal, printable report for any selected budget.

#### 4.4 Categories Tab
Provides tools for managing the expense category hierarchy.
*   **Hierarchy Management:** Users can create, rename, and delete parent categories and sub-categories (e.g., "Food:Groceries").
*   **Inclusion Control:** Checkboxes next to each category allow the user to include or exclude it from summary calculations and charts.
*   **Data Portability:** The entire category structure and inclusion settings can be exported to and imported from a JSON file.

#### 4.5 Data Tab
A centralized hub for data import/export and advanced management.
*   **Backup & Restore:** Provides buttons to export and import "Assets Data" and "Expenses Data" separately, allowing for complete backup and restoration of the application state.
*   **Historical Data Import:** Allows back-filling of historical data by importing daily account values from a specified CSV format.
*   **Raw Data Editor:** A text area allows advanced users to directly view and edit the raw JSON of their net worth history for manual corrections.

#### 4.6 System-Wide Features
*   **Authentication:** Optional user authentication via Firebase (Email/Password). If not used, the app functions in a local-only mode.
*   **Versioning:** The app version is displayed in the footer, which opens a "What's New" changelog modal.

---

### 5. Data Structures
The application relies on a set of well-defined TypeScript interfaces to model its data.

*   **`Institution`**: Represents a financial institution or a real estate asset.
    ```typescript
    export interface Institution {
      id: string; // Unique identifier
      name: string; // e.g., "Main Street Bank", "123 Main St"
      type: 'financial' | 'real_estate';
      assetValue?: number; // For real estate: Property Value
      liabilityValue?: number; // For real estate: Mortgage Balance
    }
    ```
*   **`Account`**: Represents a single account within a financial institution.
    ```typescript
    export interface Account {
      id: string; // Unique identifier
      institutionId: string; // Links to an Institution
      name: string; // e.g., "Everyday Checking"
      balance: number; // Cash portion of the account
      stockHoldings: StockHolding[]; // Array of stocks
      cdHoldings: CDHolding[]; // Array of CDs
    }
    ```
    *   **`StockHolding`**: A single stock position.
        ```typescript
        export interface StockHolding {
          id: string;
          symbol: string; // e.g., "AAPL"
          shares: number;
          purchasePrice: number; // Price per share at time of purchase
          currentPrice: number; // Live market price
        }
        ```
    *   **`CDHolding`**: A Certificate of Deposit.
        ```typescript
        export interface CDHolding {
          id: string;
          principal: number;
          interestRate: number; // e.g., 5.5 for 5.5%
          openDate: string; // "YYYY-MM-DD"
          maturityDate: string; // "YYYY-MM-DD"
        }
        ```
*   **`ExpenseTransaction`**: A single expense or income transaction.
    ```typescript
    export interface ExpenseTransaction {
      id: string;
      transactionDate: string; // "YYYY-MM-DD"
      postDate: string; // "YYYY-MM-DD"
      description: string; // "STARBUCKS #1234"
      category: string; // e.g., "Food:Coffee"
      type: string; // "debit", "credit", "sale", etc.
      amount: number; // Negative for expenses, positive for income
      memo: string;
    }
    ```
*   **`Budget`**: Defines a budget with multiple line items.
    ```typescript
    export interface Budget {
      id: string;
      name: string; // e.g., "2024 Monthly Plan"
      items: BudgetItem[];
    }
    ```
    *   **`BudgetItem`**: A single line item within a budget.
        ```typescript
        export interface BudgetItem {
          category: string; // e.g., "Food:Groceries"
          amount: number; // Monthly budgeted amount
        }
        ```
*   **`CategoryHierarchy`**: A record object representing the parent-child relationship of categories.
    ```typescript
    // { [parentName]: childName[] }
    // Example: { "Food": ["Groceries", "Restaurants"], "Utilities": [] }
    export type CategoryHierarchy = Record<string, string[]>;
    ```

---

### 6. Deployment Requirements

The application is a static Single Page Application (SPA) built with Vite. It can be deployed to any modern static hosting provider.

#### 6.1 Development Environment (Vite)
As outlined in `README.md`:
1.  **Prerequisites:** Node.js and npm.
2.  **Installation:** Run `npm install`.
3.  **Environment Variables:** Create a `.env.local` file in the project root and populate it with the necessary API keys (Gemini, Alpha Vantage, Firebase).
4.  **Execution:** Run `npm run dev` to start the local development server.

#### 6.2 Production Environment (IIS)
To deploy the application to a Windows Server running IIS:
1.  **Build the Application:** Run `npm run build`. This command uses Vite to bundle all application code and assets into a `dist` folder. During this process, Vite will replace all instances of `import.meta.env.VITE_*` with the actual values from your `.env.local` file, embedding them directly into the static JavaScript files.
2.  **IIS Server Setup:**
    *   Ensure the **IIS URL Rewrite Module** is installed on the server. This is critical for SPA routing.
    *   In IIS Manager, create a new website.
    *   Set the "Physical path" of the website to the `dist` folder generated in step 1.
3.  **Configure URL Rewrite:**
    *   Because this is a SPA, all navigation requests (e.g., `/expenses`, `/budget`) must be routed to `index.html` to let the React Router handle them.
    *   Create a `web.config` file in the `dist` folder with the following content:
        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <configuration>
          <system.webServer>
            <rewrite>
              <rules>
                <rule name="React SPA" stopProcessing="true">
                  <match url=".*" />
                  <conditions logicalGrouping="MatchAll">
                    <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                    <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                  </conditions>
                  <action type="Rewrite" url="/" />
                </rule>
              </rules>
            </rewrite>
          </system.webServer>
        </configuration>
        ```
    *   With this `web.config` in place, the site is now ready to serve the application.

### 7. Conclusion

This document provides a comprehensive overview of the Net Worth Tracker application. It should serve as the foundation for future development, feature enhancements, and maintenance activities.
