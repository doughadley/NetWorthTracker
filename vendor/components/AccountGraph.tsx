import React, { useEffect, useRef, useMemo } from 'react';
import { Chart } from 'chart.js/auto';
import { HistoricalDataPoint } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';

interface AccountGraphProps {
  historicalData: HistoricalDataPoint[];
  accountId: string;
}

const AccountGraph: React.FC<AccountGraphProps> = ({ historicalData, accountId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const accountHistory = useMemo(() => {
    return historicalData
      .map(point => ({
        date: point.date,
        value: point.accountValues[accountId]
      }))
      .filter(point => typeof point.value === 'number') // Only include points where this account existed
      .sort((a, b) => a.date.localeCompare(b.date)); // Ensure chronological order
  }, [historicalData, accountId]);

  useEffect(() => {
    if (!canvasRef.current || accountHistory.length < 2) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = accountHistory.map(d => d.date);
    const dataPoints = accountHistory.map(d => d.value);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Account Value',
          data: dataPoints,
          borderColor: '#475569', // secondary color
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0, // No points for a mini graph
          pointHoverRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) label += formatCurrencyWhole(context.parsed.y);
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            display: false, // Hide y-axis
          },
          x: {
            display: true, // Show x-axis for dates
            border: {
                display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                font: {
                    size: 10,
                },
                color: '#64748b', // slate-500
                callback: function(value: any, index: number, values: any[]) {
                    // Show only the first and last label
                    if (index === 0 || index === values.length - 1) {
                         // Add a day to date to account for timezone issues where it might show the previous day
                         const date = new Date(labels[index]);
                         date.setDate(date.getDate() + 1);
                         // Format as M/D/YY
                         return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
                    }
                    return ''; // Hide other labels
                },
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [accountHistory, accountHistory.length]);
  
  // Don't render anything if there isn't enough data for a meaningful graph
  if (accountHistory.length < 2) {
    return null;
  }

  return (
    // Increase height to accommodate dates
    <div className="relative h-24 mb-3 -mx-1">
        <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AccountGraph;