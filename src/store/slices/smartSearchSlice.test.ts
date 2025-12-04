import { configureStore } from '@reduxjs/toolkit';
import type { SmartSearchState } from './smartSearchSlice';
import smartSearchReducer, {
  togglePropertyPanel,
  setPropertyPanelVisible,
  setFiltersOverlayVisible,
  selectPropertyPanelVisible,
  selectFiltersOverlayVisible,
} from './smartSearchSlice';

// Helper function to create a test store
const createTestStore = (initialState?: Partial<SmartSearchState>) => {
  return configureStore({
    reducer: {
      smartSearch: smartSearchReducer,
    },
    preloadedState: initialState
      ? {
          smartSearch: {
            ...getDefaultState(),
            ...initialState,
          },
        }
      : undefined,
  });
};

// Helper to get default state (minimal required fields)
const getDefaultState = (): SmartSearchState => ({
  mapControls: {
    activePanel: null,
    panelWidth: 350,
  },
  viewMode: 'map',
  filters: {
    location: { state: null, suburb: null, postcode: null },
    priceRange: { min: null, max: null },
    bedrooms: { min: null, max: null },
    bathrooms: { min: null },
    parking: { min: null },
    propertyTypes: [],
    listingType: null,
  },
  activeFilters: [],
  sortBy: 'newest',
  properties: [],
  loading: false,
  error: null,
  errorType: null,
  retryCount: 0,
  totalCount: 0,
  displayedCount: 0,
  paginationOffset: 0,
  filtersApplied: {},
  mapCenter: null,
  selectedAddress: null,
  mapBounds: null,
  searchBounds: null,
  manualMapMove: false,
  userDefinedMapArea: false,
  persistedMapCenter: null,
  persistedMapZoom: 12,
  mapAreaType: 'none',
  drawMode: false,
  drawnPolygons: [],
  drawnPolygonUnion: null,
  schools: {
    isLoading: false,
    error: null,
    data: [],
    selectedSchoolIds: [],
    selectedSchoolsCache: [],
    searchQuery: '',
    schoolTypeFilter: 'all',
    catchmentFilterEnabled: false,
    catchmentUnion: null,
    catchmentComputeStatus: 'idle',
    catchmentComputeError: null,
    showSchoolsOnMap: true,
    showCatchmentRadius: false,
    selectiveSchoolFilter: false,
    searchRadius: 3,
  },
  amenities: {
    isLoading: false,
    error: null,
    data: [],
    selectedAmenityId: null,
    selectedAmenity: null,
    searchQuery: '',
    categoryFilters: [],
    showAmenitiesOnMap: true,
  },
  activeSpatialFilter: 'none',
  showSpatialConflictDialog: false,
  pendingBboxFilter: null,
  autoSearchState: {
    countdown: null,
    isActive: false,
    isSearchInitiated: false,
  },
  autoRefreshEnabled: true,
  paginationState: {
    currentPage: 1,
    itemsPerPage: 25,
    visibleProperties: [],
    totalVisibleCount: 0,
    totalPages: 0,
  },
  searchPending: false,
  // Phase 2.17.1: Collapsible Property Panel defaults
  propertyPanelVisible: true,
  filtersOverlayVisible: false,
  showSuburbBoundaries: false,
});

describe('smartSearchSlice - Phase 2.17.1 Collapsible Property Panel', () => {
  describe('togglePropertyPanel', () => {
    it('should toggle propertyPanelVisible from true to false', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      store.dispatch(togglePropertyPanel());

      const state = store.getState().smartSearch;
      expect(state.propertyPanelVisible).toBe(false);
    });

    it('should toggle propertyPanelVisible from false to true', () => {
      const store = createTestStore({ propertyPanelVisible: false });

      store.dispatch(togglePropertyPanel());

      const state = store.getState().smartSearch;
      expect(state.propertyPanelVisible).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      // Toggle to false
      store.dispatch(togglePropertyPanel());
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);

      // Toggle to true
      store.dispatch(togglePropertyPanel());
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(true);

      // Toggle to false again
      store.dispatch(togglePropertyPanel());
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
    });
  });

  describe('setPropertyPanelVisible', () => {
    it('should set propertyPanelVisible to false explicitly', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      store.dispatch(setPropertyPanelVisible(false));

      const state = store.getState().smartSearch;
      expect(state.propertyPanelVisible).toBe(false);
    });

    it('should set propertyPanelVisible to true explicitly', () => {
      const store = createTestStore({ propertyPanelVisible: false });

      store.dispatch(setPropertyPanelVisible(true));

      const state = store.getState().smartSearch;
      expect(state.propertyPanelVisible).toBe(true);
    });

    it('should set propertyPanelVisible to same value (idempotent)', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      // Setting to true when already true
      store.dispatch(setPropertyPanelVisible(true));
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(true);

      // Setting to false when already false
      store.dispatch(setPropertyPanelVisible(false));
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
      store.dispatch(setPropertyPanelVisible(false));
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
    });
  });

  describe('setFiltersOverlayVisible', () => {
    it('should set filtersOverlayVisible to true', () => {
      const store = createTestStore({ filtersOverlayVisible: false });

      store.dispatch(setFiltersOverlayVisible(true));

      const state = store.getState().smartSearch;
      expect(state.filtersOverlayVisible).toBe(true);
    });

    it('should set filtersOverlayVisible to false', () => {
      const store = createTestStore({ filtersOverlayVisible: true });

      store.dispatch(setFiltersOverlayVisible(false));

      const state = store.getState().smartSearch;
      expect(state.filtersOverlayVisible).toBe(false);
    });

    it('should toggle drawer state multiple times', () => {
      const store = createTestStore({ filtersOverlayVisible: false });

      // Open drawer
      store.dispatch(setFiltersOverlayVisible(true));
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(true);

      // Close drawer
      store.dispatch(setFiltersOverlayVisible(false));
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);

      // Open drawer again
      store.dispatch(setFiltersOverlayVisible(true));
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(true);
    });
  });

  describe('selectPropertyPanelVisible selector', () => {
    it('should return true when propertyPanelVisible is true', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      const result = selectPropertyPanelVisible(store.getState());

      expect(result).toBe(true);
    });

    it('should return false when propertyPanelVisible is false', () => {
      const store = createTestStore({ propertyPanelVisible: false });

      const result = selectPropertyPanelVisible(store.getState());

      expect(result).toBe(false);
    });

    it('should return correct value after state changes', () => {
      const store = createTestStore({ propertyPanelVisible: true });

      // Initial value
      expect(selectPropertyPanelVisible(store.getState())).toBe(true);

      // After toggle
      store.dispatch(togglePropertyPanel());
      expect(selectPropertyPanelVisible(store.getState())).toBe(false);

      // After explicit set
      store.dispatch(setPropertyPanelVisible(true));
      expect(selectPropertyPanelVisible(store.getState())).toBe(true);
    });
  });

  describe('selectFiltersOverlayVisible selector', () => {
    it('should return false when filtersOverlayVisible is false', () => {
      const store = createTestStore({ filtersOverlayVisible: false });

      const result = selectFiltersOverlayVisible(store.getState());

      expect(result).toBe(false);
    });

    it('should return true when filtersOverlayVisible is true', () => {
      const store = createTestStore({ filtersOverlayVisible: true });

      const result = selectFiltersOverlayVisible(store.getState());

      expect(result).toBe(true);
    });

    it('should return correct value after state changes', () => {
      const store = createTestStore({ filtersOverlayVisible: false });

      // Initial value
      expect(selectFiltersOverlayVisible(store.getState())).toBe(false);

      // After setting to true
      store.dispatch(setFiltersOverlayVisible(true));
      expect(selectFiltersOverlayVisible(store.getState())).toBe(true);

      // After setting to false
      store.dispatch(setFiltersOverlayVisible(false));
      expect(selectFiltersOverlayVisible(store.getState())).toBe(false);
    });
  });

  describe('Default state initialization', () => {
    it('should initialize with propertyPanelVisible as true', () => {
      const store = createTestStore();

      const state = store.getState().smartSearch;
      expect(state.propertyPanelVisible).toBe(true);
    });

    it('should initialize with filtersOverlayVisible as false', () => {
      const store = createTestStore();

      const state = store.getState().smartSearch;
      expect(state.filtersOverlayVisible).toBe(false);
    });
  });
});
