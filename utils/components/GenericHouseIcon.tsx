import React from 'react';

const GenericHouseIcon: React.FC<{className?: string}> = ({ className }) => (
    <div className={`flex items-center justify-center bg-slate-200 rounded-full ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    </div>
);

export default GenericHouseIcon;