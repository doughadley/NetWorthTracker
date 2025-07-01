import React, { useMemo, useRef, useEffect } from 'react';
import { Institution, Account, HistoricalDataPoint, StockHolding } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import InstitutionView from './InstitutionView';
import NetWorthGraph from './NetWorthGraph';
import { Chart } from 'chart.js/auto';


// SVG Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
  <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061l-2.47 2.47a.75.75 0 0 1-1.165-.892A5.5 5.5 0 0 0 6.64 4.887a.75.75 0 0 1-1.06-1.06A7 7 0 0 1 15.312 5.312Zm-10.624 9.376a.75.75 0 0 1 0-1.061l2.47-2.47a.75.75 0 0 1 1.165.892A5.5 5.5 0 0 0 13.36 15.113a.75.75 0 0 1 1.06 1.06A7 7 0 0 1 4.688 14.688Z" clipRule="evenodd" />
</svg>
);

const ArrowsPointingOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m-9 12v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 0h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const ArrowsPointingInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
  </svg>
);

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

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
      <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.135.74.34 1.056.602a.75.75 0 0 1-1.228.878A2.25 2.25 0 0 0 13.25 7h-6.5a2.25 2.25 0 0 0-1.581.682.75.75 0 0 1-1.228-.878A3.734 3.734 0 0 1 5 6.302V2.75Zm3.559 8.24a.75.75 0 0 1 1.06 0l1.5 1.5a.75.75 0 0 1-1.06 1.06l-.97-.97v3.172a.75.75 0 0 1-1.5 0V12.58l-.97.97a.75.75 0 0 1-1.06-1.06l1.5-1.5ZM5.5 10a.75.75 0 0 0-1.5 0v3.25A2.75 2.75 0 0 0 6.75 16h6.5A2.75 2.75 0 0 0 16 13.25V10a.75.75 0 0 0-1.5 0v3.25c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25V10Z" clipRule="evenodd" />
    </svg>
);

const institutionColorThemes = [
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', totalValueText: 'text-teal-900' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', totalValueText: 'text-rose-900' },
  { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', totalValueText: 'text-sky-900' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', totalValueText: 'text-amber-900' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', totalValueText: 'text-violet-900' },
  { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-800', totalValueText: 'text-lime-900' },
];

const allocationColors = {
  'Stocks': 'rgb(2, 132, 199)',    // sky-600
  'Cash': 'rgb(16, 185, 129)',   // emerald-500
  'CDs': 'rgb(139, 92, 246)',    // violet-500
  'Real Estate': 'rgb(245, 158, 11)' // amber-500
};

interface AssetsViewProps {
  totalNetWorth: number;
  ytdNetWorth: { amount: number; percentage: number } | null;
  isLoadingPrices: boolean;
  institutions: Institution[];
  accounts: Account[];
  historicalData: HistoricalDataPoint[];
  expandedInstitutions: Set<string>;
  expandedAccounts: Set<string>;
  onOpenAddInstitutionModal: () => void;
  onOpenEditInstitutionModal: (institution: Institution) => void;
  onDeleteInstitution: (institutionId: string) => void;
  onOpenAddAccountModal: () => void;
  onOpenEditAccountModal: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onRefreshStockPrices: () => void;
  onToggleInstitutionExpand: (id: string) => void;
  onToggleAccountExpand: (id: string) => void;
  onExpandAllInstitutions: () => void;
  onCollapseAllInstitutions: () => void;
  onExpandAllAccounts: () => void;
  onCollapseAllAccounts: () => void;
  calculateAccountValue: (account: Account) => number;
  onExportAssetsData: () => void;
  onImportAssetsClick: () => void;
  onPrintAssetsReport: () => void;
}

const AssetsView: React.FC<AssetsViewProps> = ({
  totalNetWorth,
  ytdNetWorth,
  isLoadingPrices,
  institutions,
  accounts,
  historicalData,
  expandedInstitutions,
  expandedAccounts,
  onOpenAddInstitutionModal,
  onOpenEditInstitutionModal,
  onDeleteInstitution,
  onOpenAddAccountModal,
  onOpenEditAccountModal,
  onDeleteAccount,
  onRefreshStockPrices,
  onToggleInstitutionExpand,
  onToggleAccountExpand,
  onExpandAllInstitutions,
  onCollapseAllInstitutions,
  onExpandAllAccounts,
  onCollapseAllAccounts,
  calculateAccountValue,
  onExportAssetsData,
  onImportAssetsClick,
  onPrintAssetsReport
}) => {

  const hasFinancialInstitutions = institutions.some(inst => inst.type === 'financial');
  const allocationCanvasRef = useRef<HTMLCanvasElement>(null);
  const allocationChartRef = useRef<Chart | null>(null);

  const allocationData = useMemo(() => {
    let totals = { 'Stocks': 0, 'Cash': 0, 'CDs': 0, 'Real Estate': 0 };

    accounts.forEach(acc => {
        totals['Cash'] += acc.balance;
        acc.stockHoldings.forEach(h => {
            totals['Stocks'] += h.shares * h.currentPrice;
        });
        acc.cdHoldings.forEach(cd => {
            totals['CDs'] += cd.principal;
        });
    });

    institutions.forEach(inst => {
        if (inst.type === 'real_estate') {
            totals['Real Estate'] += (inst.assetValue || 0);
        }
    });
    
    const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

    const filteredData = Object.entries(totals)
        .filter(([_, value]) => value > 0);

    return {
        labels: filteredData.map(([label, _]) => label),
        data: filteredData.map(([_, value]) => value),
        colors: filteredData.map(([label, _]) => allocationColors[label as keyof typeof allocationColors]),
        total: grandTotal,
    };
  }, [accounts, institutions]);

  useEffect(() => {
    if (!allocationCanvasRef.current) return;
    const ctx = allocationCanvasRef.current.getContext('2d');
    if (!ctx) return;
  
    if (allocationChartRef.current) {
        allocationChartRef.current.destroy();
    }
  
    allocationChartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: allocationData.labels,
            datasets: [{
                data: allocationData.data,
                backgroundColor: allocationData.colors,
                borderColor: '#fff',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = allocationData.total > 0 ? ((value / allocationData.total) * 100).toFixed(1) : 0;
                            return `${label}: ${formatCurrencyWhole(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    return () => {
        if (allocationChartRef.current) {
            allocationChartRef.current.destroy();
        }
    };
  }, [allocationData]);


  const topMoversData = useMemo(() => {
    const aggregatedStocks: Record<string, { symbol: string; gainLoss: number }> = {};

    accounts.forEach(account => {
      account.stockHoldings.forEach(holding => {
        const currentValue = holding.shares * holding.currentPrice;
        const purchaseValue = holding.shares * holding.purchasePrice;
        const gainLoss = currentValue - purchaseValue;

        if (!aggregatedStocks[holding.symbol]) {
          aggregatedStocks[holding.symbol] = {
            symbol: holding.symbol,
            gainLoss: 0,
          };
        }
        aggregatedStocks[holding.symbol].gainLoss += gainLoss;
      });
    });

    const stocksWithGains = Object.values(aggregatedStocks).sort((a, b) => b.gainLoss - a.gainLoss);
    
    if (stocksWithGains.length === 0) return { topGainers: [], topLosers: [] };
    
    const gainers = stocksWithGains.filter(s => s.gainLoss > 0.01);
    const losers = stocksWithGains.filter(s => s.gainLoss < -0.01).reverse();

    return {
      topGainers: gainers.slice(0, 3),
      topLosers: losers.slice(0, 3),
    };
  }, [accounts]);
  
  // Derived state for toggle buttons
  const allExpandableAccounts = accounts.filter(acc => acc.balance > 0 || (acc.stockHoldings && acc.stockHoldings.length > 0) || (acc.cdHoldings && acc.cdHoldings.length > 0));
  const areAllInstitutionsExpanded = institutions.length > 0 && expandedInstitutions.size === institutions.length;
  const areAllAccountsExpanded = allExpandableAccounts.length > 0 && expandedAccounts.size === allExpandableAccounts.length;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={onOpenAddInstitutionModal}
          className="flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md shadow hover:bg-emerald-600 transition duration-150"
        >
          <PlusIcon className="mr-2" /> Add Asset
        </button>
        <button
          onClick={onOpenAddAccountModal}
          disabled={!hasFinancialInstitutions}
          className={`flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md shadow hover:bg-emerald-600 transition duration-150 ${!hasFinancialInstitutions ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PlusIcon className="mr-2" /> Add Account
        </button>
        <button
          onClick={onRefreshStockPrices}
          disabled={isLoadingPrices}
          className="flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-md shadow hover:bg-sky-600 transition duration-150 disabled:opacity-50"
        >
          <ArrowPathIcon className={`mr-2 ${isLoadingPrices ? 'animate-spin' : ''}`} /> 
          {isLoadingPrices ? 'Refreshing...' : 'Refresh Prices'}
        </button>
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
            onClick={onPrintAssetsReport}
            className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-md shadow hover:bg-slate-700 transition duration-150"
        >
            <PrinterIcon className="mr-2" /> Print Report
        </button>
      </div>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] gap-6 mb-8">
        
        <div className="lg:col-span-3 lg:row-span-2 bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">Net Worth History</h3>
          <NetWorthGraph data={historicalData} />
        </div>

        <div className="lg:col-span-1 lg:row-span-2 bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">Asset Allocation</h3>
          {allocationData.total > 0 ? (
              <div className="flex-grow flex flex-col justify-center items-center">
                  <div className="relative h-40 w-40">
                      <canvas ref={allocationCanvasRef}></canvas>
                  </div>
                  <div className="w-full mt-4 space-y-1 text-xs">
                      {allocationData.labels.map((label, index) => (
                          <div key={label} className="flex justify-between items-center">
                              <div className="flex items-center">
                                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: allocationData.colors[index] }}></span>
                                  <span className="text-slate-600">{label}</span>
                              </div>
                              <span className="font-semibold text-slate-700">{formatCurrencyWhole(allocationData.data[index])}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ) : (
              <div className="flex-grow flex items-center justify-center">
                  <p className="text-sm text-center text-slate-400">No assets to display.</p>
              </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl shadow p-5 flex flex-col justify-center text-center">
            <h3 className="font-semibold text-slate-500 text-sm mb-2">Total Net Worth</h3>
            <p className="text-4xl font-bold text-primary">{formatCurrencyWhole(totalNetWorth)}</p>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl shadow p-5 flex flex-col justify-center text-center">
            <h3 className="font-semibold text-slate-500 text-sm mb-2">Year-to-Date</h3>
            {ytdNetWorth ? (
                <div>
                    <p className={`text-3xl font-bold ${ytdNetWorth.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ytdNetWorth.amount >= 0 ? '+' : ''}{formatCurrencyWhole(ytdNetWorth.amount)}
                    </p>
                    <p className={`text-sm font-semibold ${ytdNetWorth.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({ytdNetWorth.percentage.toFixed(2)}%)
                    </p>
                </div>
            ) : (
                <p className="text-slate-400 text-2xl">-</p>
            )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Movers (Total Gain/Loss)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
            <div>
              <h4 className="text-sm font-semibold text-green-600 border-b border-green-200 pb-1 mb-2">Top Gainers</h4>
              {topMoversData.topGainers.length > 0 ? (
                  <ul className="space-y-1">
                      {topMoversData.topGainers.map(stock => (
                          <li key={stock.symbol} className="text-sm flex justify-between">
                              <span className="font-medium text-slate-700 truncate" title={stock.symbol}>{stock.symbol}</span>
                              <span className="text-green-600 font-semibold flex-shrink-0 ml-2">+{formatCurrencyWhole(stock.gainLoss)}</span>
                          </li>
                      ))}
                  </ul>
              ) : <p className="text-sm text-slate-400 italic">No gains recorded.</p>}
            </div>
             <div>
              <h4 className="text-sm font-semibold text-red-600 border-b border-red-200 pb-1 mb-2">Top Losers</h4>
              {topMoversData.topLosers.length > 0 ? (
                  <ul className="space-y-1">
                      {topMoversData.topLosers.map(stock => (
                          <li key={stock.symbol} className="text-sm flex justify-between">
                              <span className="font-medium text-slate-700 truncate" title={stock.symbol}>{stock.symbol}</span>
                              <span className="text-red-600 font-semibold flex-shrink-0 ml-2">{formatCurrencyWhole(stock.gainLoss)}</span>
                          </li>
                      ))}
                  </ul>
              ) : <p className="text-sm text-slate-400 italic">No losses recorded.</p>}
            </div>
          </div>
        </div>
      </div>
      
      {institutions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 border-t pt-4 mt-2 border-slate-200">
          <button 
            onClick={areAllInstitutionsExpanded ? onCollapseAllInstitutions : onExpandAllInstitutions} 
            className="flex items-center text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md shadow-sm transition duration-150"
          >
            {areAllInstitutionsExpanded ? <ArrowsPointingInIcon className="mr-1.5"/> : <ArrowsPointingOutIcon className="mr-1.5"/>}
            {areAllInstitutionsExpanded ? 'Collapse Institutions' : 'Expand Institutions'}
          </button>
          
          {allExpandableAccounts.length > 0 && (
             <button 
              onClick={areAllAccountsExpanded ? onCollapseAllAccounts : onExpandAllAccounts} 
              className="flex items-center text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md shadow-sm transition duration-150"
            >
              {areAllAccountsExpanded ? <ArrowsPointingInIcon className="mr-1.5"/> : <ArrowsPointingOutIcon className="mr-1.5"/>}
              {areAllAccountsExpanded ? 'Collapse Accounts' : 'Expand Accounts'}
            </button>
          )}
        </div>
      )}

      {institutions.length === 0 && accounts.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-slate-700">Welcome to your Net Worth Tracker!</h2>
          <p className="text-slate-500 mt-2">Start by adding an asset or institution to track your finances.</p>
        </div>
      )}

      {institutions.map((institution, index) => (
        <InstitutionView
          key={institution.id}
          institution={institution}
          accounts={accounts}
          colorTheme={institutionColorThemes[index % institutionColorThemes.length]}
          onEditInstitution={onOpenEditInstitutionModal}
          onDeleteInstitution={onDeleteInstitution}
          onEditAccount={onOpenEditAccountModal}
          onDeleteAccount={onDeleteAccount}
          calculateAccountValue={calculateAccountValue}
          expandedAccounts={expandedAccounts}
          onToggleAccountExpand={onToggleAccountExpand}
          isExpanded={expandedInstitutions.has(institution.id)}
          onToggleExpand={onToggleInstitutionExpand}
          historicalData={historicalData}
        />
      ))}
    </>
  );
};

export default AssetsView;