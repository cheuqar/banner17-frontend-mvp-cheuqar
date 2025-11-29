import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FloatingResultsButton from './FloatingResultsButton';
import smartSearchReducer from '../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../store/slices/smartSearchSlice';

/**
 * FloatingResultsButton Tests - Phase 2.17.3
 *
 * Test Coverage:
 * 1. Conditional Rendering - Should only show when panel is hidden
 * 2. Button Content - Display correct property count with locale formatting
 * 3. Redux Integration - Dispatch togglePropertyPanel on click
 * 4. Styling - Verify Style4-V2 compliance and positioning
 * 5. Accessibility - Check ARIA labels and icon presence
 */

describe('FloatingResultsButton - Phase 2.17.3', () => {
  const createMockStore = (initialState: Partial<SmartSearchState> = {}) => {
    const defaultState: SmartSearchState = {
      viewMode: 'map',
      properties: [],
      loading: false,
      error: null,
      errorType: null,
      retryCount: 0,
      totalCount: 247,
      displayedCount: 0,
      paginationOffset: 0,
      filtersApplied: {},
      autoSearchState: {
        countdown: null,
        isActive: false,
        isSearchInitiated: false,
      },
      autoRefreshEnabled: true,
      searchPending: false,
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
      sortBy: 'price_asc',
      mapCenter: { lat: -33.8688, lon: 151.2093, zoom: 12 },
      mapBounds: null,
      searchBounds: null,
      selectedAddress: null,
      manualMapMove: false,
      userDefinedMapArea: false,
      persistedMapCenter: null,
      persistedMapZoom: 12,
      mapAreaType: 'none',
      drawMode: false,
      drawnPolygons: [],
      drawnPolygonUnion: null,
      activeSpatialFilter: 'none',
      showSpatialConflictDialog: false,
      pendingBboxFilter: null,
      mapControls: { activePanel: null, panelWidth: 320 },
      paginationState: {
        currentPage: 1,
        itemsPerPage: 25,
        visibleProperties: [],
        totalVisibleCount: 0,
        totalPages: 0,
      },
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
        showSchoolsOnMap: false,
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
      propertyPanelVisible: false,
      filtersOverlayVisible: false,
      showSuburbBoundaries: false,
      ...initialState,
    };

    return configureStore({
      reducer: { smartSearch: smartSearchReducer },
      preloadedState: { smartSearch: defaultState },
    });
  };

  describe('Conditional Rendering', () => {
    it('should not render when panel is visible', () => {
      const store = createMockStore({ propertyPanelVisible: true });
      const { container } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when panel is hidden', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Button Content and Behavior', () => {
    it('should display correct property count with "results" text', () => {
      const store = createMockStore({
        propertyPanelVisible: false,
        totalCount: 247,
      });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByText('247 results')).toBeInTheDocument();
    });

    it('should format large numbers with locale string (commas)', () => {
      const store = createMockStore({
        propertyPanelVisible: false,
        totalCount: 1234,
      });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByText('1,234 results')).toBeInTheDocument();
    });

    it('should handle zero results correctly', () => {
      const store = createMockStore({
        propertyPanelVisible: false,
        totalCount: 0,
      });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByText('0 results')).toBeInTheDocument();
    });

    it('should dispatch togglePropertyPanel when clicked', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // After clicking, panel should become visible
      expect(store.getState().smartSearch.propertyPanelVisible).toBe(true);
    });

    it('should have ChevronRight icon', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      const { container } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      // MUI endIcon renders as svg element
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByLabelText('Show property list panel')).toBeInTheDocument();
    });
  });

  describe('Styling - Style4-V2 Compliance', () => {
    it('should have correct positioning styles', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      const { container } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      const wrapper = container.firstChild as HTMLElement;
      const computedStyle = window.getComputedStyle(wrapper);

      expect(computedStyle.position).toBe('absolute');
      expect(computedStyle.top).toBe('16px');
      expect(computedStyle.left).toBe('16px');
      expect(computedStyle.zIndex).toBe('1200');
    });

    it('should have Style4-V2 button color scheme', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      const { container } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      const button = screen.getByRole('button');
      const computedStyle = window.getComputedStyle(button);

      // Check for white background (Style4-V2 pattern)
      expect(computedStyle.backgroundColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
      // Check for black text (Style4-V2 pattern)
      expect(computedStyle.color).toMatch(/rgb\(0,\s*0,\s*0\)/);
    });

    it('should have correct font styling', () => {
      const store = createMockStore({ propertyPanelVisible: false });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      const button = screen.getByRole('button');
      const computedStyle = window.getComputedStyle(button);

      expect(computedStyle.fontWeight).toBe('600');
      expect(computedStyle.textTransform).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large property counts', () => {
      const store = createMockStore({
        propertyPanelVisible: false,
        totalCount: 999999,
      });
      render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );
      expect(screen.getByText('999,999 results')).toBeInTheDocument();
    });

    it('should re-render when totalCount changes', () => {
      const store = createMockStore({
        propertyPanelVisible: false,
        totalCount: 100,
      });

      const { rerender } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      expect(screen.getByText('100 results')).toBeInTheDocument();

      // Update store (simulate new search results)
      const newStore = createMockStore({
        propertyPanelVisible: false,
        totalCount: 250,
      });

      rerender(
        <Provider store={newStore}>
          <FloatingResultsButton />
        </Provider>
      );

      expect(screen.getByText('250 results')).toBeInTheDocument();
    });

    it('should disappear when panel becomes visible', () => {
      const store = createMockStore({ propertyPanelVisible: false });

      const { rerender } = render(
        <Provider store={store}>
          <FloatingResultsButton />
        </Provider>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();

      // Update store (panel becomes visible)
      const newStore = createMockStore({ propertyPanelVisible: true });

      rerender(
        <Provider store={newStore}>
          <FloatingResultsButton />
        </Provider>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
