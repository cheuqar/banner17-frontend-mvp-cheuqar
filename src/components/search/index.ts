/**
 * Barrel Export: Smart Search Header Components
 * 
 * Feature 003: Smart Search Header Redesign
 * 
 * Main exports:
 * - SearchHeader: Main container component (use this for page integration)
 * - Individual components available for testing and customization
 */

// Main header component (primary export)
export { SearchHeader } from './SearchHeader';

// Row components
export { SearchHeaderRow1 } from './SearchHeaderRow1';
export { SearchHeaderRow2 } from './SearchHeaderRow2';

// Filter components
export { TransactionFilters } from './TransactionFilters';
export { StateFilterButtons } from './StateFilterButtons';

// Input components
export { AddressSearchInput } from './AddressSearchInput';

// UI components
export { ComingSoonModal } from './ComingSoonModal';

// Set as default export for easy import
export { SearchHeader as default } from './SearchHeader';

