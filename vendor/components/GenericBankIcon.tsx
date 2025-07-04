
import React from 'react';

const GenericBankIcon: React.FC<{className?: string}> = ({ className }) => (
    <div className={`flex items-center justify-center bg-slate-200 rounded-full ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18M18.75 3v18M9 6.75h6.75M9 11.25h6.75M9 15.75h6.75" />
        </svg>
    </div>
);

export default GenericBankIcon;
