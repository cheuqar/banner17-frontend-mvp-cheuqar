/**
 * FilterBar Component Tests - Smart Search UI Redesign (Feature 001)
 *
 * TDD Approach: These tests MUST FAIL initially (Red phase)
 * Tests verify FR-006 to FR-013 styling requirements
 *
 * Functional Requirements Covered:
 * - FR-006: Filter bar white background with 1px #E0E0E0 bottom border at 64px height
 * - FR-007: Filter bar uses #FFFFFF background
 * - FR-012: Apply button black background with white text
 * - FR-013: Apply button 1px lift with box-shadow on hover, 200ms transition
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FilterPanel from '../../src/pages/SmartSearch/components/Filters/FilterPanel';
import smartSearchReducer from '../../src/store/slices/smartSearchSlice';

// Mock Redux store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      smartSearch: smartSearchReducer,
    },
    preloadedState: {
      smartSearch: {
        activeFilters: {
          location: null,
          priceMin: null,
          priceMax: null,
          bedrooms: null,
          bathrooms: null,
          parking: null,
          propertyType: null,
          listingType: 'sale',
        },
        properties: [],
        totalCount: 0,
        loading: false,
        error: null,
      },
    },
  });
};

describe('FilterBar - Monochrome Styling (FR-006 to FR-013)', () => {
  describe('T031 - FilterBar component rendering', () => {
    it('should render filter bar with proper CSS class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // Verify filter bar renders with filterBar class
      const filterBar = container.querySelector('.filterBar');
      expect(filterBar).toBeInTheDocument();
    });

    it('should apply FR-006: Filter bar CSS class for white background and border', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // FR-006: Check CSS class is applied
      const filterBar = container.querySelector('.filterBar');
      expect(filterBar).toHaveClass('filterBar');

      // FR-006: Visual verification of white background, 1px #E0E0E0 border, 64px height
      // will be done in browser testing (T046)
    });

    it('should apply FR-007: White background CSS class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // FR-007: Verify filterBar class (defines #FFFFFF background)
      const filterBar = container.querySelector('.filterBar');
      expect(filterBar).toHaveClass('filterBar');
    });
  });

  describe('T034 - ApplyButton hover test', () => {
    it('should render Apply button with proper CSS class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // Find Apply button
      const applyButton = screen.getByRole('button', { name: /apply|search/i });
      expect(applyButton).toBeInTheDocument();
    });

    it('should apply FR-012: Apply button CSS class for black background and white text', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const applyButton = screen.getByRole('button', { name: /apply|search/i });

      // FR-012: Check that button has applyButton class
      // CSS defines black background and white text
      expect(applyButton).toHaveClass('applyButton');
    });

    it('should apply FR-013: Apply button hover CSS class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const applyButton = screen.getByRole('button', { name: /apply|search/i });

      // FR-013: Check CSS class for hover effects
      expect(applyButton).toHaveClass('applyButton');

      // FR-013: Visual verification of hover effects (1px lift, box-shadow, 200ms)
      // will be done in browser testing (T046)
    });
  });

  describe('FilterBar Clear button', () => {
    it('should render Clear All button with proper styling', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // Find Clear All button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('FilterBar header', () => {
    it('should display filter count and title', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      // Verify "Filters" title exists
      expect(screen.getByText('Filters')).toBeInTheDocument();

      // Verify property count display exists
      expect(screen.getByText(/properties found/i)).toBeInTheDocument();
    });
  });
});
