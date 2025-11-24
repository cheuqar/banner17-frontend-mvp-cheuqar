import type { SearchFiltersState, AddressSearchState } from '../../src/types/searchFilters';

describe('Redux Persist - Feature 001: Address Search State', () => {

  // Simulate the Redux persist migration function from store/index.ts
  const mockAddressSearchMigration = (state: any) => {
    // Feature 001 v12: Initialize addressSearch state if missing
    if (state?.searchFilters && state.searchFilters.addressSearch === undefined) {
      state.searchFilters.addressSearch = null;
    }

    // Feature 001 v12: Exclude schoolPanelOpen from persistence (transient state)
    if (state?.searchFilters) {
      state.searchFilters.schoolPanelOpen = false;
    }

    return Promise.resolve(state);
  };

  it('should initialize addressSearch field if missing during migration', async () => {
    const oldState = {
      searchFilters: {
        transactionType: 'buy' as const,
        stateFilter: 'NSW' as const,
        schoolPanelOpen: true,
        selectedSchools: [],
        lastUpdated: 1234567890,
        // Note: addressSearch is missing (old persisted state)
      },
    };

    const migratedState = await mockAddressSearchMigration(oldState);

    expect(migratedState.searchFilters.addressSearch).toBeNull();
  });

  it('should reset schoolPanelOpen to false during migration', async () => {
    const oldState = {
      searchFilters: {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: true, // Was open in previous session
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 1234567890,
      },
    };

    const migratedState = await mockAddressSearchMigration(oldState);

    expect(migratedState.searchFilters.schoolPanelOpen).toBe(false);
  });

  it('should preserve addressSearch if it exists in persisted state', async () => {
    const mockAddress: AddressSearchState = {
      label: 'Mosman NSW 2088',
      address: 'Mosman',
      state: 'NSW',
      postcode: '2088',
      latitude: -33.8289,
      longitude: 151.2430,
      timestamp: 1234567890,
    };

    const persistedState = {
      searchFilters: {
        transactionType: 'buy' as const,
        stateFilter: 'NSW' as const,
        schoolPanelOpen: true,
        selectedSchools: [],
        addressSearch: mockAddress,
        lastUpdated: 1234567890,
      },
    };

    const migratedState = await mockAddressSearchMigration(persistedState);

    expect(migratedState.searchFilters.addressSearch).toEqual(mockAddress);
    expect(migratedState.searchFilters.addressSearch?.latitude).toBe(-33.8289);
  });

  it('should handle migration for fresh app state', async () => {
    const freshState = {
      searchFilters: {
        transactionType: null,
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        addressSearch: null,
        lastUpdated: 0,
      },
    };

    const migratedState = await mockAddressSearchMigration(freshState);

    expect(migratedState.searchFilters.addressSearch).toBeNull();
    expect(migratedState.searchFilters.schoolPanelOpen).toBe(false);
  });
});
