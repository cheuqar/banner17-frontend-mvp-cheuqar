/**
 * Tests: CompactFilterBar Component
 *
 * Integration tests for compact filter bar in Smart Search
 * Tests: Rendering, all filters present, responsive layout, Redux integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompactFilterBar from './index';
import smartSearchReducer from '../../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';

/**
 * Mock all sub-components to test CompactFilterBar container logic
 */
jest.mock('./components/LocationSearchInput', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="location-search-input" aria-disabled={disabled}>
      LocationSearchInput
    </div>
  ),
}));

// Phase 2.30 FIX: Removed AreaScopeToggle mock - component removed for mandatory bbox filtering
jest.mock('./components/ApplyButton', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="apply-button" aria-disabled={disabled}>
      ApplyButton
    </div>
  ),
}));

jest.mock('./components/PriceRangeSelector', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="price-range-selector" aria-disabled={disabled}>
      PriceRangeSelector
    </div>
  ),
}));

jest.mock('./components/BedroomRangeSelector', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="bedroom-range-selector" aria-disabled={disabled}>
      BedroomRangeSelector
    </div>
  ),
}));

jest.mock('./components/PropertyTypeSelector', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="property-type-selector" aria-disabled={disabled}>
      PropertyTypeSelector
    </div>
  ),
}));

jest.mock('./components/MoreFiltersButton', () => ({
  __esModule: true,
  default: ({ disabled }: any) => (
    <div data-testid="more-filters-button" aria-disabled={disabled}>
      MoreFiltersButton
    </div>
  ),
}));

/**
 * Mock useMediaQuery for responsive testing
 */
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn((query) => {
      // Default to desktop
      if (query.includes('min-width: 900px')) return true; // isDesktop
      if (query.includes('max-width: 899.95px')) return false; // not isTablet
      if (query.includes('max-width: 599.95px')) return false; // not isMobile
      return false;
    }),
  };
});

/**
 * Setup Redux store with initial state
 */
const createTestStore = (partialState: Partial<SmartSearchState> = {}) => {
  const defaultState = smartSearchReducer(undefined, { type: '@@INIT' });
  return configureStore({
    reducer: {
      smartSearch: smartSearchReducer,
    },
    preloadedState: {
      smartSearch: {
        ...defaultState,
        ...partialState,
      },
    },
  });
};

describe('CompactFilterBar Component (Container)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Component renders without errors
   */
  it('renders compact filter bar without errors', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    expect(filterBar).toBeInTheDocument();
  });

  /**
   * Test 2: All 6 filter components are rendered
   * Phase 2.30: Changed AreaScopeToggle → ApplyButton for mandatory bbox filtering
   */
  it('renders all 6 filter components', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    expect(screen.getByTestId('location-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('price-range-selector')).toBeInTheDocument();
    expect(screen.getByTestId('bedroom-range-selector')).toBeInTheDocument();
    expect(screen.getByTestId('property-type-selector')).toBeInTheDocument();
    expect(screen.getByTestId('more-filters-button')).toBeInTheDocument();
    expect(screen.getByTestId('apply-button')).toBeInTheDocument();
  });

  /**
   * Test 3: Has correct ARIA label (navigation landmark)
   */
  it('has correct ARIA label for accessibility', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    expect(filterBar).toHaveAttribute('role', 'navigation');
  });

  /**
   * Test 4: Disabled prop applies to all sub-components
   * Phase 2.30: Updated to test ApplyButton instead of AreaScopeToggle
   */
  it('passes disabled prop to all sub-components', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar disabled={true} />
      </Provider>
    );

    expect(screen.getByTestId('location-search-input')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('price-range-selector')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('bedroom-range-selector')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('property-type-selector')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('more-filters-button')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('apply-button')).toHaveAttribute('aria-disabled', 'true');
  });

  /**
   * Test 5: Responsive layout - Desktop (1-row)
   */
  it('renders desktop layout (1 row) when screen >= 900px', () => {
    const store = createTestStore();
    const { useMediaQuery } = require('@mui/material');

    // Mock desktop view
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 900px')) return true;
      if (query.includes('max-width: 899.95px')) return false;
      if (query.includes('max-width: 599.95px')) return false;
      return false;
    });

    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    // Desktop layout should be flex row
    expect(filterBar).toHaveStyle({
      display: 'flex',
    });
  });

  /**
   * Test 6: Responsive layout - Tablet (2-row grid)
   */
  it('renders tablet layout (2-row grid) when 600px <= screen < 900px', () => {
    const store = createTestStore();
    const { useMediaQuery } = require('@mui/material');

    // Mock tablet view
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 900px')) return false;
      if (query.includes('max-width: 899.95px')) return true;
      if (query.includes('max-width: 599.95px')) return false;
      return false;
    });

    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    // Tablet layout should be grid
    expect(filterBar).toHaveStyle({
      display: 'grid',
    });
  });

  /**
   * Test 7: Responsive layout - Mobile (vertical stack)
   */
  it('renders mobile layout (vertical stack) when screen < 600px', () => {
    const store = createTestStore();
    const { useMediaQuery } = require('@mui/material');

    // Mock mobile view
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 900px')) return false;
      if (query.includes('max-width: 899.95px')) return false;
      if (query.includes('max-width: 599.95px')) return true;
      return false;
    });

    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    // Mobile layout should be flex column
    expect(filterBar).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
  });

  /**
   * Test 8: Filter bar has black background
   */
  it('has black background (#0b2d2c)', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    expect(filterBar).toHaveStyle({
      backgroundColor: '#0b2d2c',
    });
  });

  /**
   * Test 9: Filter bar is sticky positioned
   */
  it('is sticky positioned with correct z-index', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <CompactFilterBar />
      </Provider>
    );

    const filterBar = screen.getByLabelText('Property search filters');
    expect(filterBar).toHaveStyle({
      position: 'sticky',
      zIndex: 1100,
    });
  });

  /**
   * Test 10: All sub-components are functional (disabled state passes through)
   * Phase 2.30: Updated to test ApplyButton instead of AreaScopeToggle
   */
  it('all sub-components receive and respect disabled prop', () => {
    const store = createTestStore();
    const { rerender } = render(
      <Provider store={store}>
        <CompactFilterBar disabled={false} />
      </Provider>
    );

    // Initially not disabled
    expect(screen.getByTestId('location-search-input')).toHaveAttribute('aria-disabled', 'false');

    // Rerender with disabled=true
    rerender(
      <Provider store={store}>
        <CompactFilterBar disabled={true} />
      </Provider>
    );

    // All should be disabled
    expect(screen.getByTestId('location-search-input')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('apply-button')).toHaveAttribute('aria-disabled', 'true');
  });
});
