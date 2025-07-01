
import { StockPriceInfo } from '../types';

// NOTE: For this to work, you MUST set your Alpha Vantage API key as an environment variable
// named 'VITE_ALPHA_VANTAGE_API_KEY' in your development environment (e.g., in a .env file).
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchStockPrices = async (symbols: string[]): Promise<StockPriceInfo[]> => {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.error("Alpha Vantage API key is missing. Please set it in the VITE_ALPHA_VANTAGE_API_KEY environment variable.");
    alert("Stock price service is not configured. An API key is required. Please see the console for instructions.");
    return [];
  }
  
  // Important: The free Alpha Vantage plan is limited to 25 requests per day.
  // Each symbol in the request list counts as one request.
  console.log(`Fetching live prices for ${symbols.length} symbols...`);

  const pricePromises = symbols.map(async (symbol) => {
    const upperSymbol = symbol.toUpperCase();
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`HTTP error for ${upperSymbol}! status: ${response.status}`);
        return null; // Don't throw, let Promise.all continue
      }
      const data = await response.json();
      
      // Check for API rate limit message or other API-level errors
      const note = data.Note || data.Information;
      if (note) {
        console.warn(`API Note for ${upperSymbol}:`, note);
        // Throw a specific error for rate limiting to be caught later
        if (typeof note === 'string' && note.includes('API call frequency')) {
            throw new Error('RATE_LIMIT');
        }
        return null;
      }

      const globalQuote = data['Global Quote'];
      if (globalQuote && Object.keys(globalQuote).length > 0 && globalQuote['05. price']) {
        const price = parseFloat(globalQuote['05. price']);
        return { symbol: upperSymbol, price };
      } else {
        console.warn(`Could not retrieve price for symbol: ${upperSymbol}. It may be an invalid symbol.`);
        return null;
      }
    } catch (error: any) {
        // Re-throw the rate limit error to be caught by the outer Promise.all catch block
        if (error.message === 'RATE_LIMIT') {
            throw error;
        }
        console.error(`Failed to fetch price for ${upperSymbol}:`, error);
        return null; // Return null for other individual errors
    }
  });

  try {
    const results = await Promise.all(pricePromises);
    // Filter out any null results from failed requests
    return results.filter((priceInfo): priceInfo is StockPriceInfo => priceInfo !== null);
  } catch (error: any) {
      if (error.message === 'RATE_LIMIT') {
          alert("API request limit reached. The free plan is limited (e.g., 25 requests per day). Please try again later.");
      } else {
          // General error for Promise.all failure
          alert("An unexpected error occurred while fetching some stock prices.");
      }
      return []; // Return empty on critical failure like rate limit
  }
};
