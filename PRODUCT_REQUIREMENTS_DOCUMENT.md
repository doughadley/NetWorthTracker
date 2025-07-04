# Product Requirements Document: Net Worth Tracker

**Version:** 1.12.0
**Date:** July 4, 2025
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
    *   A dropdown allows users to view data for any month with recorded transactions. A "Compare with Budget" dropdown is located next to the month selector.
    *   Displays total spending for the selected month and compares it to the previous month.
    *   The primary analysis card features a **"Spending by Category"** bar chart (which becomes a stacked **"Spending vs. Budget"** chart when a budget is selected) and can be toggled to show a new **"Spending by Type"** matrix for more granular analysis.
        *   **Interactive Filtering**: The matrix is interactive. Clicking on a category, a spending type total, or a specific cell value will filter the transaction list below to show only the relevant expenses. A status bar indicates the active filter, which can be easily cleared.
*   **Transaction List:**
    *   Transactions are grouped by month, then by parent category and sub-category.
    *   Supports searching, bulk selection, and re-categorization. When a search is active, a 'Select All Results' button appears, allowing the user to perform bulk actions on all matching transactions.
    *   **Spending Type Classification**: Each transaction can be classified as 'Non-Discretionary', 'Discretionary', or 'One-Time' via a dropdown.
    *   **Bulk Updates**: The spending type and category can be updated for multiple selected transactions at once.
    *   Smart re-categorization prompts the user to update other similar transactions.
*   **Printable Expense Report:**
    *   A "Report" button generates a comprehensive, print-friendly report for the selected month.
    *   The report includes a detailed **Expenses by Spending Type** matrix, breaking down spending by category and type.
    *   It also includes an **Actual vs. Budgeted Expenses** comparison if a budget is selected. If no budget is chosen, a summary of **Actual Expenses** is shown instead.

#### 4.3 Budget Tab
This tab allows users to create and monitor budgets.
*   **Budget Creation:** Users can automatically generate a budget based on the a-average spending from selected historical months and categories.
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
*   **Destructive Action Confirmation:** Deleting either "Assets Data" or "Expenses Data" prompts the user with a confirmation modal. To proceed, the user must type the word "DELETE", preventing accidental data loss.
*   **Historical Data Import:** Allows back-filling of historical data by importing daily account values from a specified CSV format.
*   **Raw Data Editor:** A text area allows advanced users to directly view and edit the raw JSON of their net worth history for manual corrections.

#### 4.6 System-Wide Features
*   **Authentication:** Optional user authentication via Firebase (Email/Password). If not used, the app functions in a local-only mode.
*   **User Documentation Modal:** A modal containing a comprehensive user guide is accessible from the application footer. It provides detailed, step-by-step instructions on how to use all major features of the application.
*   **Versioning:** The app version is displayed in the footer, which opens a "What's New" changelog modal.

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
    *   Ensure the **IIS URL Rewrite Module** is installed on the server. This can be installed via the Web Platform Installer or directly from the IIS website. It is critical for SPA routing.
    *   In IIS Manager, create a new website or use an existing one.
    *   Set the **Physical path** of the website to the `dist` folder generated in step 1.
    *   Configure the site's **Application Pool** to use `.NET CLR version: No Managed Code`, as the site only contains static files and does not require a .NET runtime.
3.  **Configure URL Rewrite:**
    *   Because this is a SPA, all navigation requests (e.g., `/expenses`, `/budget`) must be rewritten to serve the `index.html` file, allowing the client-side React Router to handle them.
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