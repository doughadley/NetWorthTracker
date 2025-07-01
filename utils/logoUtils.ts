
export const generateLogoUrl = (name: string): string => {
  // A simple heuristic to generate a domain from an institution name.
  // This is not foolproof and works best for major, well-known institutions.
  const cleanedName = name
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/bank/g, '')
    .replace(/creditunion/g, '')
    .replace(/financial/g, '')
    .replace(/investments/g, '')
    .replace(/&co/g, '')
    .replace(/group/g, '')
    .replace(/llc/g, '')
    .replace(/inc/g, '');

  // We assume a .com domain, which is a big assumption but a good start.
  const domain = `${cleanedName}.com`;
  
  // Use a public logo finding service.
  return `https://logo.clearbit.com/${domain}`;
};
