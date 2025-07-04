
import React, { useState, useEffect } from 'react';
import { generateLogoUrl } from '../utils/logoUtils';
import GenericBankIcon from './GenericBankIcon';

interface InstitutionLogoProps {
  institutionName: string;
  className?: string;
}

const InstitutionLogo: React.FC<InstitutionLogoProps> = ({ institutionName, className = 'w-16 h-16' }) => {
  const [logoUrl, setLogoUrl] = useState<string>(generateLogoUrl(institutionName));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Reset error state and update URL when institution name changes
    setHasError(false);
    setLogoUrl(generateLogoUrl(institutionName));
  }, [institutionName]);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return <GenericBankIcon className={className} />;
  }

  return (
    <img
      src={logoUrl}
      alt={`${institutionName} logo`}
      onError={handleError}
      className={`${className} object-contain bg-white rounded-full p-1 shadow-sm border border-slate-200`}
    />
  );
};

export default InstitutionLogo;
