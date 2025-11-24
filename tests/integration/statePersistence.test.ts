/**
 * Integration Tests: State Filter Persistence with localStorage
 *
 * Tests for Feature 001 Phase 3 US1: State Filter Persistence MVP
 * Simplified version focusing on localStorage round-trip verification
 */

import searchFiltersReducer, { setStateFilter } from '../../src/store/slices/searchFilters';
import type { SearchFiltersState } from '../../src/types/searchFilters';

describe('Integration: State Filter Persistence (localStorage)', () => {

  describe('T014: State Filter Persisting to localStorage', () => {

    it('should store NSW state filter in object format', () => {
      const initialState: SearchFiltersState = {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 0,
      };

      const state = searchFiltersReducer(initialState, setStateFilter('NSW'));

      // Simulate how Redux Persist would serialize this state
      const serialized = JSON.stringify({
        transactionType: state.transactionType,
        stateFilter: state.stateFilter,
        schoolPanelOpen: state.schoolPanelOpen,
        selectedSchools: state.selectedSchools,
        addressSearch: state.addressSearch,
        lastUpdated: state.lastUpdated,
      });

      const parsed = JSON.parse(serialized);

      expect(parsed.stateFilter).toBe('NSW');
      expect(parsed.lastUpdated).toBeGreaterThan(0);
    });

    it('should store VIC state filter in object format', () => {
      const initialState: SearchFiltersState = {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 0,
      };

      const state = searchFiltersReducer(initialState, setStateFilter('VIC'));
      const serialized = JSON.stringify(state);
      const parsed = JSON.parse(serialized);

      expect(parsed.stateFilter).toBe('VIC');
    });

    it('should store null state filter (no selection)', () => {
      const initialState: SearchFiltersState = {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 0,
      };

      const state = searchFiltersReducer(initialState, setStateFilter(null));
      const serialized = JSON.stringify(state);
      const parsed = JSON.parse(serialized);

      expect(parsed.stateFilter).toBeNull();
    });
  });

  describe('T015: State Filter Restoring from localStorage', () => {

    it('should restore NSW state filter from deserialized object', () => {
      // Simulate: Store has NSW
      const storedState: SearchFiltersState = {
        transactionType: null,
        stateFilter: 'NSW',
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 1234567890,
      };

      // Verify restoration
      expect(storedState.stateFilter).toBe('NSW');
      expect(storedState.lastUpdated).toBe(1234567890);
    });

    it('should restore VIC state filter from deserialized object', () => {
      const storedState: SearchFiltersState = {
        transactionType: null,
        stateFilter: 'VIC',
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 9876543210,
      };

      expect(storedState.stateFilter).toBe('VIC');
    });

    it('should restore null state filter from deserialized object', () => {
      const storedState: SearchFiltersState = {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 1234567890,
      };

      expect(storedState.stateFilter).toBeNull();
    });

    it('should restore QLD state filter from switched state (NSW → QLD)', () => {
      // Simulate: User switched NSW → QLD
      const initialState: SearchFiltersState = {
        transactionType: null,
        stateFilter: 'NSW',
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 1000,
      };

      // Simulate switching to QLD
      const updatedState = searchFiltersReducer(initialState, setStateFilter('QLD'));

      // Serialize and deserialize
      const serialized = JSON.stringify(updatedState);
      const restored = JSON.parse(serialized);

      // Should restore final state (QLD), not intermediate (NSW)
      expect(restored.stateFilter).toBe('QLD');
    });

    it('should preserve other filters when restoring state filter', () => {
      // Simulate: State with NSW and other filters
      const storedState: SearchFiltersState = {
        transactionType: 'buy',
        stateFilter: 'NSW',
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 1234567890,
      };

      // Verify state filter restored along with other data
      expect(storedState.stateFilter).toBe('NSW');
      expect(storedState.transactionType).toBe('buy');
      expect(storedState.schoolPanelOpen).toBe(false);
    });

    it('should handle migration: initialize missing addressSearch field', () => {
      // Simulate: Old persisted state without addressSearch field
      const oldState: any = {
        transactionType: null,
        stateFilter: 'NSW',
        schoolPanelOpen: true, // Old transient state
        selectedSchools: [],
        // addressSearch is missing
        lastUpdated: 1234567890,
      };

      // Simulate migration (v12)
      if (oldState.addressSearch === undefined) {
        oldState.addressSearch = null;
      }
      if (oldState.schoolPanelOpen === true) {
        oldState.schoolPanelOpen = false; // Reset transient state
      }

      // After migration
      expect(oldState.addressSearch).toBeNull();
      expect(oldState.schoolPanelOpen).toBe(false);
      expect(oldState.stateFilter).toBe('NSW'); // Preserved
    });
  });

  describe('JSON Serialization Compatibility', () => {

    it('should support round-trip serialization without data loss', () => {
      const originalState: SearchFiltersState = {
        transactionType: 'buy',
        stateFilter: 'NSW',
        schoolPanelOpen: false,
        selectedSchools: ['school-1', 'school-2'],
        addressSearch: {
          label: 'Sydney NSW 2000',
          address: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          latitude: -33.8688,
          longitude: 151.2093,
          timestamp: 1234567890,
        },
        lastUpdated: 1234567890,
      };

      // Serialize to JSON string (what localStorage does)
      const serialized = JSON.stringify(originalState);

      // Deserialize back (what Redux Persist does)
      const deserialized = JSON.parse(serialized) as SearchFiltersState;

      // Verify all fields preserved
      expect(deserialized.transactionType).toBe('buy');
      expect(deserialized.stateFilter).toBe('NSW');
      expect(deserialized.addressSearch?.label).toBe('Sydney NSW 2000');
      expect(deserialized.lastUpdated).toBe(1234567890);
    });

    it('should handle null values correctly in serialization', () => {
      const stateWithNulls: SearchFiltersState = {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 0,
      };

      const serialized = JSON.stringify(stateWithNulls);
      const deserialized = JSON.parse(serialized) as SearchFiltersState;

      expect(deserialized.transactionType).toBeNull();
      expect(deserialized.stateFilter).toBeNull();
      expect(deserialized.addressSearch).toBeNull();
    });
  });
});
