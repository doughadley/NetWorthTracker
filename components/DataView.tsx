import React, { useState, useEffect } from 'react';
import { HistoricalDataPoint } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.422a49.98 49.98 0 0 1 11.67 0a.75.75 0 1 0 .53-1.422A50.901 50.901 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
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
  onDeleteAssetsData: () => void;
  onDeleteExpensesData: () => void;
}

const DataView: React.FC<DataViewProps> = ({
  historicalData,
  onHistoricalDataUpdate,
  onExportAssetsData,
  onImportAssetsClick,
  onExportExpensesData,
  onImportExpensesClick,
  onImportHistoricalClick,
  onDeleteAssetsData,
  onDeleteExpensesData,
}) => {
  const [editedData, setEditedData] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'assets' | 'expenses' | null>(null);

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

  const handleDeleteClick = (type: 'assets' | 'expenses') => {
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deleteType === 'assets') {
      onDeleteAssetsData();
    } else if (deleteType === 'expenses') {
      onDeleteExpensesData();
    }
    setDeleteType(null);
  };

  return (
    <>
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
                    <ArrowDownTrayIcon className="mr-2" /> Export Assets
                </button>
                <button
                    onClick={onImportAssetsClick}
                    className="flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md shadow hover:bg-slate-700 transition duration-150"
                >
                    <ArrowUpTrayIcon className="mr-2" /> Import Assets
                </button>
                 <button
                    onClick={() => handleDeleteClick('assets')}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-150"
                >
                    <TrashIcon className="mr-2" /> Delete Assets
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
                    <ArrowDownTrayIcon className="mr-2" /> Export Expenses
                </button>
                <button
                    onClick={onImportExpensesClick}
                    className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 transition duration-150"
                >
                    <ArrowUpTrayIcon className="mr-2" /> Import Expenses
                </button>
                <button
                    onClick={() => handleDeleteClick('expenses')}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-150"
                >
                    <TrashIcon className="mr-2" /> Delete Expenses
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        dataLabel={deleteType === 'assets' ? 'All Assets, Accounts & History' : 'All Expenses, Budgets & Categories'}
      />
    </>
  );
};

export default DataView;