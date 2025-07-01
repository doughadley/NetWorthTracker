import React from 'react';
import { Institution, Account, HistoricalDataPoint } from '../types';
import AccountView from './AccountView';
import { formatCurrencyWhole } from '../utils/formatters';
import InstitutionLogo from './InstitutionLogo';
import GenericHouseIcon from './GenericHouseIcon';

// Define the structure for the color theme object
interface ColorTheme {
  bg: string;
  border: string;
  text: string;
  totalValueText: string;
}

interface InstitutionViewProps {
  institution: Institution;
  accounts: Account[];
  onEditInstitution: (institution: Institution) => void;
  onDeleteInstitution: (institutionId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  calculateAccountValue: (account: Account) => number;
  expandedAccounts: Set<string>;
  onToggleAccountExpand: (accountId:string) => void;
  isExpanded: boolean;
  onToggleExpand: (institutionId: string) => void;
  colorTheme: ColorTheme;
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


const InstitutionView: React.FC<InstitutionViewProps> = ({ 
  institution, 
  accounts, 
  onEditInstitution, 
  onDeleteInstitution,
  onEditAccount,
  onDeleteAccount,
  calculateAccountValue,
  expandedAccounts,
  onToggleAccountExpand,
  isExpanded,
  onToggleExpand,
  colorTheme,
  historicalData
}) => {
  const isRealEstate = institution.type === 'real_estate';
  const institutionAccounts = accounts.filter(acc => acc.institutionId === institution.id);
  
  const totalInstitutionValue = isRealEstate 
    ? (institution.assetValue || 0) - (institution.liabilityValue || 0)
    : institutionAccounts.reduce((sum, acc) => sum + calculateAccountValue(acc), 0);

  const ytdValues = React.useMemo(() => {
    if (institution.type !== 'financial' || historicalData.length < 1 || institutionAccounts.length === 0) {
        return null;
    }

    const currentYear = new Date().getFullYear().toString();
    
    const sortedDataForYear = historicalData
        .filter(p => p.date.startsWith(currentYear))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (sortedDataForYear.length === 0) return null;

    const firstDataPointOfTheYear = sortedDataForYear[0];
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (sortedDataForYear.length === 1 && firstDataPointOfTheYear.date === todayStr) {
      return null;
    }
    
    const accountIdsForInstitution = new Set(institutionAccounts.map(acc => acc.id));

    let startOfYearValue = 0;
    for (const accountId in firstDataPointOfTheYear.accountValues) {
        if (accountIdsForInstitution.has(accountId)) {
            startOfYearValue += firstDataPointOfTheYear.accountValues[accountId] || 0;
        }
    }

    if (startOfYearValue === 0) return null;
    
    const ytdAmount = totalInstitutionValue - startOfYearValue;
    const ytdPercentage = (ytdAmount / startOfYearValue) * 100;

    return { amount: ytdAmount, percentage: ytdPercentage };

  }, [historicalData, totalInstitutionValue, institution, institutionAccounts]);

  const totalReturnValues = React.useMemo(() => {
    if (institution.type !== 'financial' || historicalData.length < 2 || institutionAccounts.length === 0) {
        return null;
    }

    const accountIdsForInstitution = new Set(institutionAccounts.map(acc => acc.id));
    const sortedData = [...historicalData].sort((a, b) => a.date.localeCompare(b.date));
    
    const firstDataPoint = sortedData.find(point => 
        Object.keys(point.accountValues).some(accId => accountIdsForInstitution.has(accId) && typeof point.accountValues[accId] === 'number')
    );
    
    if (!firstDataPoint) return null;

    let initialValue = 0;
    for (const accountId in firstDataPoint.accountValues) {
        if (accountIdsForInstitution.has(accountId)) {
            initialValue += firstDataPoint.accountValues[accountId] || 0;
        }
    }
    
    if (initialValue === 0) return null;
    
    const amount = totalInstitutionValue - initialValue;
    const percentage = (amount / initialValue) * 100;

    return { amount, percentage };

  }, [historicalData, totalInstitutionValue, institution, institutionAccounts]);

  return (
    <div className={`${colorTheme.bg} p-4 sm:p-6 rounded-lg shadow-md mb-6`}>
      <div 
        className={`flex justify-between items-center pb-4 border-b ${colorTheme.border} cursor-pointer`}
        onClick={() => onToggleExpand(institution.id)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`institution-details-${institution.id}`}
      >
        <div className="flex items-center space-x-4 flex-grow">
            {isRealEstate ? (
                <GenericHouseIcon className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            ) : (
                <InstitutionLogo institutionName={institution.name} className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            )}
            <div className="flex-grow">
                <h3 className={`text-xl sm:text-2xl font-semibold ${colorTheme.text}`}>{institution.name}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-baseline sm:space-x-3 mt-1">
                  <p className={`text-xl font-bold ${colorTheme.totalValueText}`}>
                      {isRealEstate ? 'Net Value: ' : 'Total Value: '} 
                      {formatCurrencyWhole(totalInstitutionValue)}
                  </p>
                  {!isRealEstate && (ytdValues || totalReturnValues) && (
                      <div className="flex items-baseline space-x-3">
                          {ytdValues && (
                              <div className={`text-sm font-semibold ${ytdValues.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <span>YTD: {formatCurrencyWhole(ytdValues.amount)}</span>
                                <span className="ml-1">({ytdValues.percentage.toFixed(2)}%)</span>
                              </div>
                          )}
                          {totalReturnValues && (
                               <div className={`text-sm font-semibold ${totalReturnValues.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <span>Total: {formatCurrencyWhole(totalReturnValues.amount)}</span>
                                <span className="ml-1">({totalReturnValues.percentage.toFixed(2)}%)</span>
                              </div>
                          )}
                      </div>
                  )}
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onEditInstitution(institution); }}
            className="text-xs px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
           >
            Edit
           </button>
           <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isRealEstate && institutionAccounts.length > 0) {
                alert("Cannot delete institution with accounts. Please delete accounts first.");
                return;
              }
              if (window.confirm(`Are you sure you want to delete "${institution.name}"?`)) {
                onDeleteInstitution(institution.id);
              }
            }}
            className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
           >
            Delete
           </button>
           <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(institution.id); }}
            className="text-slate-600 hover:text-slate-900"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
           >
             {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
           </button>
        </div>
      </div>
      {isExpanded && (
        <div id={`institution-details-${institution.id}`} className="mt-4">
            {isRealEstate ? (
                <div className="space-y-2 text-sm p-3 bg-white/50 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Property Value</span>
                        <span className="font-semibold text-slate-800">{formatCurrencyWhole(institution.assetValue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Mortgage Balance</span>
                        <span className="font-semibold text-slate-800">{formatCurrencyWhole(institution.liabilityValue || 0)}</span>
                    </div>
                </div>
            ) : institutionAccounts.length > 0 ? (
                institutionAccounts.map(account => (
                <AccountView 
                    key={account.id} 
                    account={account} 
                    onEdit={onEditAccount}
                    onDelete={onDeleteAccount}
                    calculatedValue={calculateAccountValue(account)}
                    isExpanded={expandedAccounts.has(account.id)}
                    onToggleExpand={onToggleAccountExpand}
                    historicalData={historicalData}
                />
                ))
            ) : (
                <p className="text-slate-500 italic pt-4">No accounts in this institution.</p>
            )}
        </div>
      )}
    </div>
  );
};

export default InstitutionView;