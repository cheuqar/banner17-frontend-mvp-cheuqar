import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FilterDialog from './FilterDialog';
import smartSearchReducer from '../../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../../store/slices/smartSearchSlice';

// Mock filter components
jest.mock('./LocationFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="location-filter">Location Filter</div>,
}));

jest.mock('./PriceRangeFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="price-filter">Price Range Filter</div>,
}));

jest.mock('./BedroomsFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="bedrooms-filter">Bedrooms Filter</div>,
}));

jest.mock('./BathroomsFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="bathrooms-filter">Bathrooms Filter</div>,
}));

jest.mock('./ParkingFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="parking-filter">Parking Filter</div>,
}));

jest.mock('./PropertyTypeFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="property-type-filter">Property Type Filter</div>,
}));

jest.mock('./ListingTypeFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="listing-type-filter">Listing Type Filter</div>,
}));

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
  propertyPanelVisible: true,
  filtersOverlayVisible: false,
  showSuburbBoundaries: false,
});

describe('FilterDialog - Phase 2.18.1', () => {
  const createMockStore = (initialState: Partial<SmartSearchState> = {}) => {
    return configureStore({
      reducer: {
        smartSearch: smartSearchReducer,
      },
      preloadedState: {
        smartSearch: {
          ...getDefaultState(),
          ...initialState,
        },
      },
    });
  };

  const renderComponent = (storeState = {}) => {
    const store = createMockStore(storeState);
    return render(
      <Provider store={store}>
        <FilterDialog />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dialog Visibility', () => {
    it('should be hidden when filtersOverlayVisible is false', () => {
      renderComponent({ filtersOverlayVisible: false });

      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });

    it('should be visible when filtersOverlayVisible is true', () => {
      renderComponent({ filtersOverlayVisible: true });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Dialog Content', () => {
    it('should render all 7 filter components', () => {
      renderComponent({ filtersOverlayVisible: true });

      expect(screen.getByTestId('location-filter')).toBeInTheDocument();
      expect(screen.getByTestId('price-filter')).toBeInTheDocument();
      expect(screen.getByTestId('bedrooms-filter')).toBeInTheDocument();
      expect(screen.getByTestId('bathrooms-filter')).toBeInTheDocument();
      expect(screen.getByTestId('parking-filter')).toBeInTheDocument();
      expect(screen.getByTestId('property-type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('listing-type-filter')).toBeInTheDocument();
    });

    it('should display property count in header', () => {
      renderComponent({ filtersOverlayVisible: true, totalCount: 123 });

      expect(screen.getByText('123 properties found')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderComponent({ filtersOverlayVisible: true, loading: true });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  describe('Close Handlers', () => {
    it('should close on close button click', () => {
      const store = createMockStore({ filtersOverlayVisible: true });
      render(
        <Provider store={store}>
          <FilterDialog />
        </Provider>
      );

      const closeButton = screen.getByLabelText('Close filter dialog');
      fireEvent.click(closeButton);

      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);
    });

    it('should close on backdrop click', () => {
      const store = createMockStore({ filtersOverlayVisible: true });
      render(
        <Provider store={store}>
          <FilterDialog />
        </Provider>
      );

      // MUI Dialog backdrop click simulation
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);
      }
    });

    it('should close on Escape key press', () => {
      const store = createMockStore({ filtersOverlayVisible: true });
      render(
        <Provider store={store}>
          <FilterDialog />
        </Provider>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);
    });
  });

  describe('Action Buttons', () => {
    it('should dispatch performSearch on Apply button click', () => {
      const store = createMockStore({ filtersOverlayVisible: true });
      render(
        <Provider store={store}>
          <FilterDialog />
        </Provider>
      );

      const applyButton = screen.getByText(/Apply Filters/);
      fireEvent.click(applyButton);

      // Check that dialog closed
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);
    });

    it('should dispatch clearAllFilters on Clear All button click', () => {
      const store = createMockStore({
        filtersOverlayVisible: true,
        activeFilters: ['suburb', 'price_max'],
      });
      render(
        <Provider store={store}>
          <FilterDialog />
        </Provider>
      );

      const clearButton = screen.getByText('Clear All Filters');
      fireEvent.click(clearButton);

      // activeFilters should be cleared
      expect(store.getState().smartSearch.activeFilters).toEqual([]);
    });

    it('should hide Clear All button when no active filters', () => {
      renderComponent({
        filtersOverlayVisible: true,
        activeFilters: [],
      });

      expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
    });
  });
});
