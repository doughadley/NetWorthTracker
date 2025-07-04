

# Net Worth Tracker

A personal finance application to track net worth across various accounts including stock holdings, cash, savings, and CD accounts, organized by financial institution.

Current Version: **1.12.4**

## Key Features

*   **Comprehensive Asset Tracking**: Monitor financial accounts, stock holdings, cash balances, CDs, and real estate assets.
*   **Data Visualization**: View your financial progress with a historical net worth graph and an asset allocation donut chart.
*   **Live Stock Prices**: Fetch up-to-date stock prices from Alpha Vantage.
*   **Secure Authentication**: Optional, secure user sign-up and login using Firebase Authentication (email/password).
*   **Local-First & Offline Mode**: The application is fully functional without an account. All data is stored privately in your browser's local storage.
*   **Expense Tracking & Categorization**:
    *   Import transaction history from CSV files (supports Chase, Amex, BofA formats).
    *   **Smart Expense Import**: Automatically assigns categories and spending types to new transactions based on your history with a vendor.
    *   Categorize spending into a customizable hierarchy (e.g., "Food:Groceries").
    *   Classify expenses as 'Non-Discretionary', 'Discretionary', or 'One-Time' to analyze spending habits.
    *   The Period toggle, Month dropdown, and Budget dropdown are grouped in the top toolbar, allowing you to view data for a selected month or all time.
    *   A dashboard card can be toggled to show either a spending chart or a detailed, interactive spending-by-type matrix that filters the transaction list on click.
    *   When searching, a "Select All Results" button allows for bulk-editing all matching transactions.
*   **AI-Powered Insights**: Use the Google Gemini API to analyze expenses and automatically identify spending anomalies.
*   **Budgeting Tools**: Create and manage detailed budgets based on your historical spending data.
*   **Full Data Portability**: Export and import all your assets, expenses, and historical data in JSON format.
*   **Safe Data Deletion**: Confirmation dialogs require users to type "DELETE" before removing major data sets, preventing accidental loss.
*   **Printable Reports**: Generate clean, printable reports for your budgets, a complete summary of your assets, and a detailed monthly expense report.
*   **User Documentation**: A detailed user guide is accessible directly within the app via a "User Docs" link in the footer.
*   **Versioning**: Track application updates through the "What's New" changelog in the footer.

---

## Installation and Setup

Follow these steps to run the application on your local machine.

### 1. Prerequisites

*   **Node.js**: You'll need Node.js (version 18+ is recommended) installed on your system. You can download it from [nodejs.org](https://nodejs.org/). This will also install `npm`.
*   **Code Editor**: A code editor like [Visual Studio Code](https://code.visualstudio.com/) is recommended.

### 2. Initial Project Setup

If you are starting from scratch, it's best to create a new Vite project and then copy the application files into it.

1.  **Create a Vite Project**: Open your terminal, navigate to where you want to create the project, and run:
    ```bash
    npm create vite@latest my-net-worth-app -- --template react-ts
    ```
2.  **Navigate into the Directory**:
    ```bash
    cd my-net-worth-app
    ```
3.  **Copy Files**:
    *   Create a `public` directory in your project's root.
    *   Place the `version.json` file into this new `public` directory.
    *   Copy all other application source files (`.tsx`, `.ts`, `.html`, etc.) into the project, overwriting the Vite template files (like `App.tsx` and `index.css`).
4.  **Install Dependencies**: Run the following command to install the necessary packages for Vite and React.
    ```bash
    npm install
    ```

### 3. Configure Environment Variables

The application requires API keys for several services.

1.  Create a file named `.env.local` in the root of your project directory.
2.  Add the following variables to this file, replacing the placeholder text with your actual keys:

    ```
    # For AI-powered expense analysis
    VITE_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

    # For fetching live stock prices
    VITE_ALPHA_VANTAGE_API_KEY="YOUR_ALPHA_VANTAGE_API_KEY"

    # For Firebase Authentication (if you want to use login features)
    VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    ```

*   **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey).
*   **Alpha Vantage API Key**: Get from [Alpha Vantage](https://www.alphavantage.co/support/#api-key). The free plan is sufficient.
*   **Firebase Keys**: Get from your project's settings in the [Firebase Console](https://console.firebase.google.com/). You will need to enable Email/Password authentication in the "Authentication" section.

### 4. Run the Application

Once the setup is complete, run the local development server:

```bash
npm run dev
```

The application will now be running and accessible at the local URL provided in the terminal (usually `http://localhost:5173`).

---

## Deployment to Firebase Hosting

Follow these steps to deploy the application to a live URL using Firebase Hosting.

### 1. Install Firebase CLI

If you don't already have it, install the Firebase command-line tool globally on your machine.
```bash
npm install -g firebase-tools
```
*Note: If you are on a corporate network and encounter a `SELF_SIGNED_CERT_IN_CHAIN` error, you may need to configure npm to use your company's SSL certificate or temporarily disable strict SSL.*

### 2. Login to Firebase

Connect the CLI to your Firebase account. This will open a browser window for authentication.
```bash
firebase login
```

### 3. Initialize Hosting

In your project's root directory, run the initialization command to connect your project to Firebase.
```bash
firebase init hosting
```
You will be prompted with several questions. Answer them as follows:
*   **Please select an option:** `Use an existing project` (and select your project from the list).
*   **What do you want to use as your public directory?** `dist`
*   **Configure as a single-page app (rewrite all urls to /index.html)?** `y`
*   **Set up automatic builds and deploys with GitHub?** `N` (for manual deployment)
*   **File dist/index.html already exists. Overwrite?** `N` (Do not overwrite your build output).

This will create `firebase.json` and `.firebaserc` files in your project. This application now includes base versions of these files to ensure correct deployment settings.

### 4. Build the Application

Create an optimized production build of your application. This command bundles all your code into the `dist` folder.
```bash
npm run build
```

### 5. Deploy

Upload the contents of the `dist` folder to Firebase Hosting.
```bash
firebase deploy
```

After the command completes, it will display the live URL for your application (e.g., `https://your-project-id.web.app`).

---

## Versioning

This project uses a simple versioning system managed through the `version.json` file. This file must be placed in the `public` directory.

*   `currentVersion`: The version number displayed in the application footer.
*   `changelog`: An array of objects, where each object contains the version number, release date, and a description of the changes for that version. The description supports Markdown for formatting.

To update the version, simply edit this file.

---

## Technologies Used

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Charting**: Chart.js
*   **Authentication**: Firebase
*   **AI Services**: Google Gemini API
*   **Financial Data**: Alpha Vantage API
*   **Markdown Parsing**: Marked.js