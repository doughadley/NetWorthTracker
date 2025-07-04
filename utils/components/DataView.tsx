import React, { useState, useEffect } from 'react';
import { HistoricalDataPoint } from '../types';

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.905 3.129V2.75Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);

const ArrowUpTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 11.75a.75.75 0 0 0-1.5 0v-8.614L6.295 6.265a.75.75 0 1 0-1.09-1.03l4.25-4.5a.75.75 0 0 0 1.09 0l4.25 4.5a.75.75 0 0 0-1.09 1.03l-2.905-3.129v8.614Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);

interface DataViewProps {
  historicalData: HistoricalDataPoint[];
  onHistoricalDataUpdate: (data: HistoricalDataPoint[]) => void;
  onExportAssetsData: () => void;
  onImportAssetsClick: () => void;
  onExportExpensesData: () => void;
  onImportExpensesClick: () => void;
  onImportHistoricalClick: () => void;
}

const DataView: React.FC<DataViewProps> = ({
  historicalData,
  onHistoricalDataUpdate,
  onExportAssetsData,
  onImportAssetsClick,
  onExportExpensesData,
  onImportExpensesClick,
  onImportHistoricalClick,
}) => {
  const [editedData, setEditedData] = useState('');

  useEffect(() => {
    setEditedData(JSON.stringify(historicalData, null, 2));
  }, [historicalData]);

  const handleSaveChanges = () => {
    try {
      const parsedData = JSON.parse(editedData);
      if (!Array.isArray(parsedData)) {
        throw new Error("Data must be an array.");
      }
      if (parsedData.length > 0 && (typeof parsedData[0].date !== 'string' || typeof parsedData[0].netWorth !== 'number')) {
          throw new Error("Data format is incorrect. Each item must have a 'date' (string) and 'netWorth' (number).");
      }
      onHistoricalDataUpdate(parsedData);
      alert('Historical data saved successfully!');
    } catch (error) {
      console.error("Failed to save historical data:", error);
      alert(`Error saving data: ${error instanceof Error ? error.message : "Invalid JSON format."}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4">Data Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Data Section */}
        <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700">Assets, Accounts & History</h3>
          <p className="text-sm text-slate-500">
            Export or import your assets, accounts, and historical graph data. Importing will overwrite only this set of data.
          </p>
          <div className="flex flex-wrap gap-3">
              <button
                  onClick={onExportAssetsData}
                  className="flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md shadow hover:bg-slate-700 transition duration-150"
              >
                  <ArrowDownTrayIcon className="mr-2" /> Export Assets Data
              </button>
              <button
                  onClick={onImportAssetsClick}
                  className="flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md shadow hover:bg-slate-700 transition duration-150"
              >
                  <ArrowUpTrayIcon className="mr-2" /> Import Assets Data
              </button>
          </div>
        </div>
        {/* Expenses Data Section */}
        <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700">Expenses, Budgets & Categories</h3>
          <p className="text-sm text-slate-500">
            Export or import your expense transactions, budgets, and category structure. Importing will overwrite only this set of data.
          </p>
          <div className="flex flex-wrap gap-3">
              <button
                  onClick={onExportExpensesData}
                  className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 transition duration-150"
              >
                  <ArrowDownTrayIcon className="mr-2" /> Export Expenses Data
              </button>
              <button
                  onClick={onImportExpensesClick}
                  className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 transition duration-150"
              >
                  <ArrowUpTrayIcon className="mr-2" /> Import Expenses Data
              </button>
          </div>
        </div>
      </div>

      {/* Historical Account Data Import Section */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700">Historical Account Data Import</h3>
        <p className="text-sm text-slate-500">
          Import a CSV file to add or update daily account values. This is useful for back-filling your history.
          The CSV must have the following header: <code className="bg-slate-200 text-slate-800 p-1 rounded text-xs">Date,Institution Name,Account Name,Value</code>
        </p>
         <div className="flex flex-wrap gap-3">
            <button
                onClick={onImportHistoricalClick}
                className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md shadow hover:bg-teal-700 transition duration-150"
            >
                <ArrowUpTrayIcon className="mr-2" /> Import Historical CSV
            </button>
        </div>
      </div>

      
      {/* Historical Data Editor Section */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700">Historical Data Editor</h3>
        <p className="text-sm text-slate-500">
          Directly edit the JSON for your historical net worth data. Use this for manual corrections. Be careful, as incorrect formatting can cause issues.
        </p>
        <textarea
          value={editedData}
          onChange={(e) => setEditedData(e.target.value)}
          className="w-full h-96 font-mono text-xs p-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50 text-black"
          spellCheck="false"
          aria-label="Historical Data JSON Editor"
        />
        <div className="flex justify-end">
            <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default DataView;