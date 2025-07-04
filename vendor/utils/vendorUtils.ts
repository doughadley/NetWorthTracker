/**
 * A collection of heuristics to extract a "base" vendor name from a raw transaction description.
 * This aims to group vendors together even if the description has transaction-specific noise
 * like store numbers, dates, or purchase IDs.
 *
 * Example: "STARBUCKS #12345" and "STARBUCKS STORE 9876" should both resolve to "starbucks".
 */
export const getBaseVendor = (description: string): string => {
  if (!description) {
    return '';
  }

  let vendor = description.toLowerCase();

  // Remove common prefixes and suffixes that add little value
  vendor = vendor
    .replace(/^payment to /i, '')
    .replace(/^payment from /i, '')
    .replace(/ llc$/, '')
    .replace(/ inc$/, '')
    .replace(/ corp$/, '')
    .replace(/ co$/, '');

  // Remove anything that looks like a store number, transaction ID, or phone number.
  // This removes sequences of digits, potentially with #, -, or space separators.
  vendor = vendor
    .replace(/#\d+/g, '') // #12345
    .replace(/ \d{4,}$/, '') // trailing 4+ digit number (often a store id)
    .replace(/ \d{1,2}-\d{1,2}$/, '') // trailing date like 12-25
    .replace(/\b\d{5,}\b/g, '') // standalone 5+ digit numbers
    .replace(/\b[a-z0-9]{8,}\b/g, (match) => { // remove long alphanumeric strings that are likely IDs
        if (/\d/.test(match) && /[a-z]/.test(match)) {
            return '';
        }
        return match;
    });

  // Remove special characters and trim excess whitespace
  vendor = vendor
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Collapse multiple spaces
    .trim();

  // Exclude 'venmo' if it's the only thing left, as it's a payment method, not a vendor.
  if (vendor === 'venmo') {
    return '';
  }

  return vendor;
};
