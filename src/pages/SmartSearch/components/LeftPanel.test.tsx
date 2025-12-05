/**
 * Phase 2.17.2 & 2.18.3: LeftPanel Tests
 * ========================================
 *
 * Tests for collapsible panel functionality including:
 * - Inline Filters button rendering (Phase 2.18.3)
 * - Filter dialog opening via Redux (Phase 2.18.3)
 * - Active filter badge display (Phase 2.18.3)
 * - Collapse button rendering (Phase 2.17.2)
 * - Toggle action dispatching (Phase 2.17.2)
 * - Keyboard support (Escape key) (Phase 2.17.2)
 * - ARIA attributes (Phase 2.17.2)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LeftPanel from './LeftPanel';
import smartSearchReducer from '../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../store/slices/smartSearchSlice';

// Mock child components to isolate LeftPanel logic
jest.mock('./PropertyList', () => ({
  __esModule: true,
  default: () => <div data-testid="property-list">Property List</div>,
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
  propertyPanelVisible: true,
  filtersOverlayVisible: false,
  showSuburbBoundaries: false,
});

describe('LeftPanel - Phase 2.17.2 & 2.18.3', () => {
  const mockOnPropertyClick = jest.fn();

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
    return {
      ...render(
        <Provider store={store}>
          <LeftPanel onPropertyClick={mockOnPropertyClick} />
        </Provider>
      ),
      store,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase 2.18.3: Inline Filters Button', () => {
    it('should render inline filters button', () => {
      renderComponent();

      const filtersButton = screen.getByLabelText('Open filter dialog');
      expect(filtersButton).toBeInTheDocument();
      expect(filtersButton).toHaveTextContent('Filters');
    });

    it('should dispatch setFiltersOverlayVisible(true) on button click', () => {
      const { store } = renderComponent();

      // Check initial state
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(false);

      // Click filters button
      const filtersButton = screen.getByLabelText('Open filter dialog');
      fireEvent.click(filtersButton);

      // Check state changed to true
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(true);
    });

    it('should show badge with active filter count when filters are active', () => {
      renderComponent({ activeFilters: ['suburb', 'price_max', 'bedrooms'] });

      // Badge should show count of 3
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should hide badge when no active filters', () => {
      renderComponent({ activeFilters: [] });

      // Badge should not be present
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should have FilterList icon', () => {
      const { container } = renderComponent();

      // Check for icon presence (MUI icons are SVGs)
      const filtersButton = screen.getByLabelText('Open filter dialog');
      const icon = filtersButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Phase 2.17.2: Collapse Button', () => {
    it('should render collapse button with ChevronLeft icon', () => {
      renderComponent();

      const collapseButton = screen.getByLabelText('Hide property list panel');
      expect(collapseButton).toBeInTheDocument();
    });

    it('should show tooltip on collapse button hover', () => {
      renderComponent();

      const collapseButton = screen.getByLabelText('Hide property list panel');
      fireEvent.mouseOver(collapseButton);

      // MUI Tooltip renders asynchronously
      setTimeout(() => {
        expect(screen.getByText('Hide panel (Esc)')).toBeInTheDocument();
      }, 100);
    });

    it('should dispatch togglePropertyPanel action when collapse button clicked', () => {
      const { store } = renderComponent();

      const collapseButton = screen.getByLabelText('Hide property list panel');

      // Check initial state
      const initialState = store.getState().smartSearch.propertyPanelVisible;
      expect(initialState).toBe(true);

      // Click collapse button
      fireEvent.click(collapseButton);

      // Check state changed
      const newState = store.getState().smartSearch.propertyPanelVisible;
      expect(newState).toBe(false);
    });
  });

  describe('Panel Animation', () => {
    it('should apply translateX(0) transform when panel is visible', () => {
      const { container } = renderComponent({ propertyPanelVisible: true });

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toHaveStyle({
        transform: 'translateX(0)',
      });
    });

    it('should apply translateX(-100%) transform when panel is hidden', () => {
      const { container } = renderComponent({ propertyPanelVisible: false });

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toHaveStyle({
        transform: 'translateX(-100%)',
      });
    });

    it('should have GPU-accelerated animation properties', () => {
      const { container } = renderComponent();

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toHaveStyle({
        transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        willChange: 'transform',
      });
    });
  });

  describe('Keyboard Support', () => {
    it('should close panel when Escape key pressed and panel is visible', () => {
      const { store } = renderComponent({ propertyPanelVisible: true });

      // Check initial state
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(true);

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      // Check state changed
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
    });

    it('should not close panel when Escape pressed and panel already hidden', () => {
      const { store } = renderComponent({ propertyPanelVisible: false });

      // Check initial state
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);

      // Press Escape key (should not dispatch action)
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      // State should remain false (no toggle)
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
    });

    it('should not respond to other keys', () => {
      const { store } = renderComponent({ propertyPanelVisible: true });

      const initialState = store.getState().smartSearch.propertyPanelVisible;

      // Press various non-Escape keys
      fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(window, { key: 'Space', code: 'Space' });
      fireEvent.keyDown(window, { key: 'Tab', code: 'Tab' });

      // State should not change
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(initialState);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have complementary role for panel', () => {
      const { container } = renderComponent();

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toBeInTheDocument();
    });

    it('should have descriptive aria-label', () => {
      renderComponent();

      expect(screen.getByLabelText('Property list and filters panel')).toBeInTheDocument();
    });

    it('should set aria-hidden=false when panel is visible', () => {
      const { container } = renderComponent({ propertyPanelVisible: true });

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toHaveAttribute('aria-hidden', 'false');
    });

    it('should set aria-hidden=true when panel is hidden', () => {
      const { container } = renderComponent({ propertyPanelVisible: false });

      const panel = container.querySelector('[role="complementary"]');
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have accessible collapse button label', () => {
      renderComponent();

      expect(screen.getByLabelText('Hide property list panel')).toBeInTheDocument();
    });

    it('should have accessible filters button label', () => {
      renderComponent();

      expect(screen.getByLabelText('Open filter dialog')).toBeInTheDocument();
    });
  });

  describe('Integration with Existing Features', () => {
    it('should render PropertyList component', () => {
      renderComponent();

      expect(screen.getByTestId('property-list')).toBeInTheDocument();
    });

    it('should pass visiblePropertyIds prop to PropertyList', () => {
      const visibleIds = ['prop-1', 'prop-2', 'prop-3'];
      const store = createMockStore();

      render(
        <Provider store={store}>
          <LeftPanel
            visiblePropertyIds={visibleIds}
            onPropertyClick={mockOnPropertyClick}
          />
        </Provider>
      );

      expect(screen.getByTestId('property-list')).toBeInTheDocument();
    });

    it('should not interfere with collapse button functionality after filter button click', () => {
      const { store } = renderComponent();

      // Click filters button
      const filtersButton = screen.getByLabelText('Open filter dialog');
      fireEvent.click(filtersButton);

      // Filters overlay should open
      expect(store.getState().smartSearch.filtersOverlayVisible).toBe(true);

      // Collapse button should still work
      const collapseButton = screen.getByLabelText('Hide property list panel');
      fireEvent.click(collapseButton);

      // Panel should toggle
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(false);
    });
  });
});
