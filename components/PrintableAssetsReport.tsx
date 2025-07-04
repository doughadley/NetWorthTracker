import React, { useEffect, useMemo, useState } from 'react';
import { Institution, Account, HistoricalDataPoint } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';
import { Chart } from 'chart.js/auto';

const allocationColors = {
  'Stocks': 'rgb(2, 132, 199)',
  'Cash': 'rgb(16, 185, 129)',
  'CDs': 'rgb(139, 92, 246)',
  'Real Estate': 'rgb(245, 158, 11)'
};

interface PrintableAssetsReportProps {
  totalNetWorth: number;
  ytdNetWorth: { amount: number; percentage: number } | null;
  institutions: Institution[];
  accounts: Account[];
  historicalData: HistoricalDataPoint[];
  calculateAccountValue: (account: Account) => number;
  onReady: () => void;
}

const PrintableAssetsReport: React.FC<PrintableAssetsReportProps> = ({
  totalNetWorth,
  ytdNetWorth,
  institutions,
  accounts,
  historicalData,
  calculateAccountValue,
  onReady,
}) => {
  const [netWorthChartImg, setNetWorthChartImg] = useState<string>('');
  const [allocationChartImg, setAllocationChartImg] = useState<string>('');
  
  // State to track if charts are rendered and ready
  const [nwChartReady, setNwChartReady] = useState(false);
  const [allocChartReady, setAllocChartReady] = useState(false);

  const allocationData = useMemo(() => {
    let totals = { 'Stocks': 0, 'Cash': 0, 'CDs': 0, 'Real Estate': 0 };
    accounts.forEach(acc => {
      totals['Cash'] += acc.balance;
      acc.stockHoldings.forEach(h => { totals['Stocks'] += h.shares * h.currentPrice; });
      acc.cdHoldings.forEach(cd => { totals['CDs'] += cd.principal; });
    });
    institutions.forEach(inst => {
      if (inst.type === 'real_estate') { totals['Real Estate'] += (inst.assetValue || 0); }
    });
    const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);
    const filteredData = Object.entries(totals).filter(([_, value]) => value > 0);
    return {
      labels: filteredData.map(([label, _]) => label),
      data: filteredData.map(([_, value]) => value),
      colors: filteredData.map(([label, _]) => allocationColors[label as keyof typeof allocationColors]),
      total: grandTotal,
    };
  }, [accounts, institutions]);

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
        topGainers: gainers.slice(0, 5), 
        topLosers: losers.slice(0, 5) 
    };
  }, [accounts]);

  const sortedInstitutions = useMemo(() => {
      return [...institutions].sort((a,b) => a.name.localeCompare(b.name));
  }, [institutions]);

  // Effect to render charts to images
  useEffect(() => {
    // Net Worth Chart
    const nwCanvas = document.createElement('canvas');
    nwCanvas.width = 800;
    nwCanvas.height = 400;
    const nwCtx = nwCanvas.getContext('2d');
    
    if (historicalData.length < 2) {
        setNwChartReady(true); // No data, so chart is "ready"
    } else if (nwCtx) {
      const sortedData = [...historicalData].sort((a, b) => a.date.localeCompare(b.date));
      new Chart(nwCtx, {
        type: 'line',
        data: {
          labels: sortedData.map(d => d.date),
          datasets: [{
            label: 'Net Worth',
            data: sortedData.map(d => d.netWorth),
            borderColor: '#0284c7', fill: true, backgroundColor: 'rgba(2, 132, 199, 0.1)', tension: 0.1, pointRadius: 0
          }]
        },
        options: {
          responsive: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              ticks: { callback: (value) => typeof value === 'number' ? formatCurrencyWhole(value) : value }
            }
          },
          animation: {
            duration: 0,
            onComplete: (animation) => {
              const chart = animation.chart;
              if (chart) {
                setNetWorthChartImg(chart.toBase64Image());
                setNwChartReady(true);
                chart.destroy();
              }
            }
          }
        }
      });
    }

    // Allocation Chart
    const allocCanvas = document.createElement('canvas');
    allocCanvas.width = 300;
    allocCanvas.height = 300;
    const allocCtx = allocCanvas.getContext('2d');

    if (allocationData.data.length === 0) {
        setAllocChartReady(true); // No data, chart is "ready"
    } else if (allocCtx) {
      new Chart(allocCtx, {
        type: 'doughnut',
        data: {
          labels: allocationData.labels,
          datasets: [{ data: allocationData.data, backgroundColor: allocationData.colors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: false,
          cutout: '65%',
          plugins: { legend: { display: false } },
          animation: {
            duration: 0,
            onComplete: (animation) => {
              const chart = animation.chart;
              if (chart) {
                setAllocationChartImg(chart.toBase64Image());
                setAllocChartReady(true);
                chart.destroy();
              }
            }
          }
        }
      });
    }
  }, [historicalData, allocationData]);

  // Effect to signal readiness to parent
  useEffect(() => {
    if (nwChartReady && allocChartReady) {
      onReady();
    }
  }, [nwChartReady, allocChartReady, onReady]);

  return (
    <div className="p-6 font-sans text-black bg-white printable-report-container">
      <header className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">Assets Report</h1>
        <p className="text-lg mt-1">As of {new Date().toLocaleDateString()}</p>
      </header>

      <main>
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-100 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-slate-600 text-sm mb-1">Total Net Worth</h3>
            <p className="text-3xl font-bold text-sky-700">{formatCurrencyWhole(totalNetWorth)}</p>
          </div>
          <div className="bg-slate-100 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-slate-600 text-sm mb-1">Year-to-Date</h3>
            {ytdNetWorth ? (
              <div>
                <p className={`text-2xl font-bold ${ytdNetWorth.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ytdNetWorth.amount >= 0 ? '+' : ''}{formatCurrencyWhole(ytdNetWorth.amount)}
                </p>
                <p className={`text-sm font-semibold ${ytdNetWorth.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({ytdNetWorth.percentage.toFixed(2)}%)
                </p>
              </div>
            ) : <p className="text-slate-400 text-2xl">-</p>}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-6 break-inside-avoid">
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-2">Net Worth History</h2>
            {netWorthChartImg ? (
              <img src={netWorthChartImg} alt="Net Worth History Chart" className="w-full border rounded-lg" />
            ) : <p>Not enough data for chart.</p>}
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-semibold mb-2">Asset Allocation</h2>
            {allocationChartImg ? (
              <div className="flex flex-col items-center">
                <img src={allocationChartImg} alt="Asset Allocation Chart" className="w-48 h-48" />
                <div className="w-full mt-4 space-y-1 text-xs">
                  {allocationData.labels.map((label, index) => (
                    <div key={label} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: allocationData.colors[index] }}></span>
                        <span>{label}</span>
                      </div>
                      <span className="font-semibold">{formatCurrencyWhole(allocationData.data[index])}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p>No assets to display.</p>}
          </div>
        </div>
        
        {/* Movers and Assets Table */}
        <div className="grid grid-cols-3 gap-6 break-inside-avoid">
            <div className="col-span-1">
                 <h2 className="text-xl font-semibold mb-2">Top Movers</h2>
                 <div className="bg-slate-100 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-700 border-b border-green-300 pb-1 mb-2">Top Gainers</h4>
                    {topMoversData.topGainers.length > 0 ? (
                        <ul className="space-y-1 text-xs">
                            {topMoversData.topGainers.map(stock => (
                                <li key={stock.symbol} className="flex justify-between">
                                    <span className="font-medium truncate">{stock.symbol}</span>
                                    <span className="text-green-600 font-semibold flex-shrink-0 ml-2">+{formatCurrencyWhole(stock.gainLoss)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-slate-500 italic">No gains.</p>}
                 </div>
                 <div className="bg-slate-100 p-3 rounded-lg mt-4">
                    <h4 className="text-sm font-semibold text-red-700 border-b border-red-300 pb-1 mb-2">Top Losers</h4>
                    {topMoversData.topLosers.length > 0 ? (
                        <ul className="space-y-1 text-xs">
                            {topMoversData.topLosers.map(stock => (
                                <li key={stock.symbol} className="flex justify-between">
                                    <span className="font-medium truncate">{stock.symbol}</span>
                                    <span className="text-red-600 font-semibold flex-shrink-0 ml-2">{formatCurrencyWhole(stock.gainLoss)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-slate-500 italic">No losses.</p>}
                </div>
            </div>
            <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-2">Asset Totals</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left font-semibold pb-1">Asset/Institution</th>
                            <th className="text-right font-semibold pb-1">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedInstitutions.map((institution) => {
                             const totalValue = institution.type === 'real_estate' 
                                ? (institution.assetValue || 0) - (institution.liabilityValue || 0)
                                : accounts.filter(acc => acc.institutionId === institution.id)
                                          .reduce((sum, acc) => sum + calculateAccountValue(acc), 0);
                            return (
                                <tr key={institution.id} className="border-b border-gray-200">
                                    <td className="py-2 font-medium">{institution.name}</td>
                                    <td className="py-2 text-right font-semibold">{formatCurrencyWhole(totalValue)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
        <p>Net Worth Tracker</p>
      </footer>
    </div>
  );
};

export default PrintableAssetsReport;