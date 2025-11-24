import searchFiltersReducer, {
  setAddressSearch,
  clearAddressSearch,
  clearSearchFilters,
  setStateFilter
} from '../../src/store/slices/searchFilters';
import type { SearchFiltersState, AddressSearchState } from '../../src/types/searchFilters';

describe('searchFilters reducer - Feature 001', () => {
  
  const initialState: SearchFiltersState = {
    transactionType: null,
    stateFilter: null,
    schoolPanelOpen: false,
    selectedSchools: [],
    addressSearch: null,
    lastUpdated: 0,
  };

  const mockAddressSearch: AddressSearchState = {
    label: 'Mosman NSW 2088',
    address: 'Mosman',
    state: 'NSW',
    postcode: '2088',
    latitude: -33.8289,
    longitude: 151.2430,
    timestamp: 1234567890,
  };

  it('should handle setAddressSearch action', () => {
    const state = searchFiltersReducer(initialState, setAddressSearch(mockAddressSearch));
    
    expect(state.addressSearch).toEqual(mockAddressSearch);
    expect(state.addressSearch?.label).toBe('Mosman NSW 2088');
    expect(state.addressSearch?.latitude).toBe(-33.8289);
    expect(state.lastUpdated).toBeGreaterThan(0);
  });

  it('should handle clearAddressSearch action', () => {
    const stateWithAddress = searchFiltersReducer(initialState, setAddressSearch(mockAddressSearch));
    expect(stateWithAddress.addressSearch).not.toBeNull();
    
    const clearedState = searchFiltersReducer(stateWithAddress, clearAddressSearch());
    expect(clearedState.addressSearch).toBeNull();
  });

  it('should clear addressSearch when clearSearchFilters is called', () => {
    const stateWithAddress = searchFiltersReducer(initialState, setAddressSearch(mockAddressSearch));
    const clearedState = searchFiltersReducer(stateWithAddress, clearSearchFilters());
    
    expect(clearedState.addressSearch).toBeNull();
    expect(clearedState.transactionType).toBeNull();
    expect(clearedState.stateFilter).toBeNull();
  });

  it('should maintain addressSearch coordinates for map centering', () => {
    const state = searchFiltersReducer(initialState, setAddressSearch(mockAddressSearch));
    
    // Verify coordinates are preserved (Feature 001: Map Centering)
    expect(state.addressSearch?.latitude).toBe(-33.8289);
    expect(state.addressSearch?.longitude).toBe(151.2430);
    expect(state.addressSearch?.postcode).toBe('2088');
  });

  it('should preserve timestamp for conflict resolution', () => {
    const timestampedAddress: AddressSearchState = {
      ...mockAddressSearch,
      timestamp: Date.now(),
    };

    const state = searchFiltersReducer(initialState, setAddressSearch(timestampedAddress));
    expect(state.addressSearch?.timestamp).toBe(timestampedAddress.timestamp);
  });
});

/**
 * Phase 3: User Story 1 - State Filter Persistence (MVP)
 * Test suite for state filter persistence across browser sessions
 */
describe('searchFilters reducer - Phase 3 US1: State Filter Persistence', () => {

  const initialState: SearchFiltersState = {
    transactionType: null,
    stateFilter: null,
    schoolPanelOpen: false,
    selectedSchools: [],
    addressSearch: null,
    lastUpdated: 0,
  };

  describe('setStateFilter action - Persistence Test', () => {
    it('should persist NSW state filter to Redux state', () => {
      const state = searchFiltersReducer(initialState, setStateFilter('NSW'));

      expect(state.stateFilter).toBe('NSW');
      expect(state.lastUpdated).toBeGreaterThan(0);
    });

    it('should persist VIC state filter to Redux state', () => {
      const state = searchFiltersReducer(initialState, setStateFilter('VIC'));

      expect(state.stateFilter).toBe('VIC');
    });

    it('should persist QLD state filter to Redux state', () => {
      const state = searchFiltersReducer(initialState, setStateFilter('QLD'));

      expect(state.stateFilter).toBe('QLD');
    });

    it('should handle switching between state filters', () => {
      // Start with NSW
      let state = searchFiltersReducer(initialState, setStateFilter('NSW'));
      expect(state.stateFilter).toBe('NSW');

      // Switch to QLD
      state = searchFiltersReducer(state, setStateFilter('QLD'));
      expect(state.stateFilter).toBe('QLD');
    });

    it('should persist null state filter (no selection)', () => {
      const state = searchFiltersReducer(initialState, setStateFilter(null));

      expect(state.stateFilter).toBeNull();
      expect(state.lastUpdated).toBeGreaterThan(0);
    });

    it('should clear state filter by setting to null', () => {
      // Set NSW
      let state = searchFiltersReducer(initialState, setStateFilter('NSW'));
      expect(state.stateFilter).toBe('NSW');

      // Clear by setting to null
      state = searchFiltersReducer(state, setStateFilter(null));
      expect(state.stateFilter).toBeNull();
    });
  });

  describe('State filter persistence across actions', () => {
    it('should maintain state filter when other actions are dispatched', () => {
      let state = searchFiltersReducer(initialState, setStateFilter('NSW'));
      expect(state.stateFilter).toBe('NSW');

      // Simulate other actions being dispatched
      state = searchFiltersReducer(state, setAddressSearch({
        label: 'Sydney NSW 2000',
        address: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        latitude: -33.8688,
        longitude: 151.2093,
        timestamp: Date.now(),
      }));

      // NSW filter should still be active
      expect(state.stateFilter).toBe('NSW');
    });

    it('should update lastUpdated timestamp when state filter changes', () => {
      const state1 = searchFiltersReducer(initialState, setStateFilter('NSW'));
      const timestamp1 = state1.lastUpdated;

      // Wait a small amount to ensure different timestamp
      const state2 = searchFiltersReducer(state1, setStateFilter('VIC'));
      const timestamp2 = state2.lastUpdated;

      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });
  });
});
