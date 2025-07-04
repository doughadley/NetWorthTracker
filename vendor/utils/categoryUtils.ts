import { ExpenseTransaction } from '../types';

/**
 * Parses a category string into its parent and child components.
 * "Food:Groceries" -> { parent: "Food", child: "Groceries" }
 * "Utilities" -> { parent: "Utilities", child: null }
 */
export const parseCategory = (category: string): { parent: string, child: string | null } => {
    if (!category) return { parent: 'Uncategorized', child: null };
    const parts = category.split(':');
    if (parts.length > 1) {
        return { parent: parts[0].trim(), child: parts.slice(1).join(':').trim() };
    }
    return { parent: category.trim(), child: null };
};

/**
 * Builds a structured hierarchy of parent categories and their sub-categories
 * from a flat list of category strings.
 * E.g., ['Food:Groceries', 'Food:Restaurants', 'Utilities'] ->
 * { 'Food': ['Groceries', 'Restaurants'], 'Utilities': [] }
 */
export const buildCategoryHierarchy = (categoryList: string[]): Record<string, string[]> => {
    const hierarchy: Record<string, Set<string>> = {};

    for (const category of categoryList) {
        const { parent, child } = parseCategory(category);
        if (!hierarchy[parent]) {
            hierarchy[parent] = new Set();
        }
        if (child) {
            hierarchy[parent].add(child);
        }
    }
    
    const result: Record<string, string[]> = {};
    for (const parent in hierarchy) {
        result[parent] = Array.from(hierarchy[parent]).sort();
    }
    
    return result;
};