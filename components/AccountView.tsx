import React, { useMemo } from 'react';
import { Account, HistoricalDataPoint } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import StockHoldingRow from './StockHoldingRow';
import CDHoldingRow from './CDHoldingRow';
import AccountGraph from './AccountGraph';

interface AccountViewProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  calculatedValue: number;
  isExpanded: boolean;
  onToggleExpand: (accountId: string) => void;
  historicalData: HistoricalDataPoint[];
}

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);


const AccountView: React.FC<AccountViewProps> = ({ account, onEdit, onDelete, calculatedValue, isExpanded, onToggleExpand, historicalData }) => {
  const hasStocks = account.stockHoldings && account.stockHoldings.length > 0;
  const hasCDs = account.cdHoldings && account.cdHoldings.length > 0;
  const hasCash = account.balance > 0;
  const hasDetailsToShow = hasStocks || hasCDs || hasCash;

  const ytdValues = useMemo(() => {
    if (historicalData.length < 1) return null;

    const currentYear = new Date().getFullYear().toString();
    
    // Sort the data by date to ensure we find the correct first entry
    const sortedDataForYear = historicalData
        .filter(p => p.date.startsWith(currentYear))
        .sort((a, b) => a.date.localeCompare(b.date));
        
    if (sortedDataForYear.length === 0) return null;
    
    const firstDataPointOfTheYear = sortedDataForYear[0];
    
    // Don't show YTD if there is only one data point for the year and it's today
    const todayStr = new Date().toISOString().split('T')[0];
    if (sortedDataForYear.length === 1 && firstDataPointOfTheYear.date === todayStr) {
      return null;
    }

    const startOfYearValue = firstDataPointOfTheYear.accountValues[account.id];
    
    if (typeof startOfYearValue !== 'number' || startOfYearValue === 0) {
      return null;
    }

    const ytdAmount = calculatedValue - startOfYearValue;
    const ytdPercentage = (ytdAmount / startOfYearValue) * 100;

    return { amount: ytdAmount, percentage: ytdPercentage };

  }, [historicalData, calculatedValue, account.id]);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => hasDetailsToShow && onToggleExpand(account.id)}>
        <div className="flex-grow">
          <h4 className="text-lg font-semibold text-primary">{account.name}</h4>
          <p className="text-xs text-slate-500">Account Total</p>
        </div>
        <div className="flex items-center">
            <div className="text-right mr-2">
              <div className="text-xl font-bold text-slate-800">{formatCurrencyWhole(calculatedValue)}</div>
              {ytdValues && (
                <div className={`text-xs font-medium ${ytdValues.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  YTD: {formatCurrencyWhole(ytdValues.amount)} ({ytdValues.percentage.toFixed(2)}%)
                </div>
              )}
            </div>
            {hasDetailsToShow && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(account.id); }}
                    className="text-slate-500 hover:text-slate-800"
                    aria-label={isExpanded ? 'Collapse account details' : 'Expand account details'}
                    aria-expanded={isExpanded}
                    aria-controls={`account-details-${account.id}`}
                >
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
            )}
        </div>
      </div>
      
      {isExpanded && hasDetailsToShow && (
        <div id={`account-details-${account.id}`} className="pt-3 mt-3 border-t border-slate-200">
          <AccountGraph accountId={account.id} historicalData={historicalData} />
          <div className="space-y-4">
            {/* Cash Balance */}
            {hasCash && (
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                    <span className="font-medium text-slate-700 text-sm">Cash Balance</span>
                    <span className="font-semibold text-slate-800 text-sm">{formatCurrencyWhole(account.balance)}</span>
                </div>
            )}

            {/* Stock Holdings */}
            {hasStocks && (
              <div>
                <h5 className="text-sm font-semibold text-slate-600 mb-1">Stock Holdings</h5>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 border-b border-slate-300 font-semibold text-xs text-slate-500">
                  <div className="col-span-1 sm:col-span-1">Symbol</div>
                  <div className="text-right sm:text-left col-span-1 sm:col-span-1">Shares</div>
                  <div className="text-right sm:text-left col-span-1 sm:col-span-1">Price</div>
                  <div className="text-right sm:text-left col-span-1 sm:col-span-1">Value</div>
                  <div className="text-right sm:text-left col-span-2 sm:col-span-2">Gain/Loss</div>
                </div>
                <div className="divide-y divide-slate-200 rounded-b-md overflow-hidden">
                    {account.stockHoldings.map(holding => (
                      <StockHoldingRow key={holding.id} holding={holding} />
                    ))}
                </div>
              </div>
            )}

            {/* CD Holdings */}
            {hasCDs && (
               <div>
                <h5 className="text-sm font-semibold text-slate-600 mb-1">CD Holdings</h5>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-1 border-b border-slate-300 font-semibold text-xs text-slate-500">
                  <div className="col-span-1">Principal</div>
                  <div className="col-span-1">Rate</div>
                  <div className="col-span-1 sm:col-span-2">Maturity</div>
                </div>
                {account.cdHoldings.map(cd => (
                  <CDHoldingRow key={cd.id} holding={cd} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(account); }}
                className="text-xs px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
            >
                Edit
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
                className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
                Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountView;