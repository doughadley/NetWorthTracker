import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { HistoricalDataPoint } from '../types';
import { formatCurrencyWhole } from '../utils/formatters';

interface NetWorthGraphProps {
  data: HistoricalDataPoint[];
}

const NetWorthGraph: React.FC<NetWorthGraphProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length < 2) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    // Sort data by date to ensure chronological order
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    const labels = sortedData.map(d => d.date);
    const netWorthData = sortedData.map(d => d.netWorth);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Net Worth',
          data: netWorthData,
          borderColor: '#0284c7', // primary color
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.2,
          pointBackgroundColor: '#0284c7',
          pointRadius: 2,
          pointHoverRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += formatCurrencyWhole(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                if (typeof value === 'number') {
                  // Abbreviate large numbers for display on the axis
                  if (Math.abs(value) >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
                  if (Math.abs(value) >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
                  return formatCurrencyWhole(value);
                }
                return value;
              }
            }
          },
          x: {
            grid: {
              display: false,
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
  }, [data]);

  if (data.length < 2) {
    return (
        <div className="flex-grow flex items-center justify-center text-slate-500 p-4">
            <p className="text-center">Your net worth history graph will appear here once you have data for more than one day.</p>
        </div>
    );
  }

  return (
    <div className="relative flex-grow w-full h-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default NetWorthGraph;