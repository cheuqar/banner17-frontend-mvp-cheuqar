/**
 * Type definitions for Smart Search Header Redesign (Feature 003)
 * 
 * These types define the state shape and interfaces for the header filter system
 */

// Transaction types for property listings (FR-003, FR-004, FR-005)
export type TransactionType = 'buy' | 'sell' | 'sold' | null;

// Australian state codes (FR-015, FR-016, FR-017, FR-018)
export type StateCode = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'ACT' | 'NT';

/**
 * Search Filters State
 * Extends existing smart search with header-specific filters
 */
export interface SearchFiltersState {
  // NEW - Header filters
  transactionType: TransactionType;      // Buy/Sell/Sold selection (FR-003, FR-004, FR-005)
  stateFilter: StateCode | null;         // Australian state selection (FR-015, FR-016, FR-017, FR-018)
  schoolPanelOpen: boolean;              // School panel toggle state (FR-006, FR-007, FR-008)
  selectedSchools?: string[];            // School IDs selected in panel
  
  // Metadata
  lastUpdated: number;                   // Timestamp for debugging and state tracking
}

/**
 * Address Suggestion from Autocomplete API
 * Used for address search in Row 2 (FR-012, FR-014, FR-024)
 */
export interface AddressSuggestion {
  id: string;                            // Unique identifier (e.g., "mosman-nsw-2088")
  label: string;                         // Display text (e.g., "Mosman NSW 2088")
  address: string;                       // Address or suburb name
  state: StateCode;                      // State abbreviation (CRITICAL for Q1 auto-clear logic)
  postcode: string;                      // Australian postcode
  type?: string;                         // Optional type field for UI display
}

/**
 * Redux action payloads
 */
export interface SetTransactionTypeAction {
  payload: TransactionType;
}

export interface SetStateFilterAction {
  payload: StateCode | null;
}

export interface ToggleSchoolPanelAction {
  // No payload - simple boolean toggle
}

export interface SetSelectedSchoolsAction {
  payload: string[];
}

export interface AutoCleanStateFilterAction {
  payload: StateCode;  // Detected state from address selection
}

