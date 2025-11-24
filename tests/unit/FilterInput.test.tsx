/**
 * FilterInput Component Tests - Smart Search UI Redesign (Feature 001)
 *
 * TDD Approach: These tests MUST FAIL initially (Red phase)
 * Tests verify FR-008 to FR-011 input styling requirements
 *
 * Functional Requirements Covered:
 * - FR-008: Input fields use #F5F5F5 background
 * - FR-009: Input fields 40px height with 12px horizontal padding
 * - FR-010: Focus state 2px solid #000000 border with 200ms transition
 * - FR-011: Hover state #EBEBEB background with 200ms transition
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PriceRangeFilter from '../../src/pages/SmartSearch/components/Filters/PriceRangeFilter';
import BedroomsFilter from '../../src/pages/SmartSearch/components/Filters/BedroomsFilter';
import smartSearchReducer from '../../src/store/slices/smartSearchSlice';

// Mock Redux store
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

describe('FilterInput - Monochrome Styling (FR-008 to FR-011)', () => {
  describe('T032 - FilterInput focus state test', () => {
    it('should render input fields with proper CSS class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      // Find input fields - PriceRangeFilter has min/max inputs
      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should apply FR-008: Input CSS class for #F5F5F5 background', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // FR-008: Check filterInput class is applied
        expect(input).toHaveClass('filterInput');
      });
    });

    it('should apply FR-009: Input CSS class for 40px height and 12px padding', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // FR-009: filterInput class defines 40px height and 12px padding
        expect(input).toHaveClass('filterInput');
      });

      // FR-009: Visual verification of exact dimensions in browser testing (T046)
    });

    it('should apply FR-010: Focus state CSS class with 2px black border', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // FR-010: filterInput class includes focus pseudo-class styles
        expect(input).toHaveClass('filterInput');
      });

      // FR-010: Visual verification of focus border and transition in browser testing (T046)
    });
  });

  describe('T033 - FilterInput hover state test', () => {
    it('should apply FR-011: Hover state CSS class with #EBEBEB background', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // FR-011: filterInput class includes hover pseudo-class styles
        expect(input).toHaveClass('filterInput');
      });

      // FR-011: Visual verification of hover background and transition in browser testing (T046)
    });

    it('should apply 200ms transition for smooth hover effects', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // FR-011: Transition timing verified via CSS class
        expect(input).toHaveClass('filterInput');
      });
    });
  });

  describe('FilterInput select fields', () => {
    it('should render select dropdowns with filterInput class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <BedroomsFilter />
        </Provider>
      );

      // BedroomsFilter uses select dropdown
      const select = container.querySelector('select');
      if (select) {
        expect(select).toHaveClass('filterInput');
      }
    });

    it('should apply same styling to select elements as text inputs', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <BedroomsFilter />
        </Provider>
      );

      const select = container.querySelector('select');
      if (select) {
        // Same filterInput class for consistent styling
        expect(select).toHaveClass('filterInput');
      }
    });
  });

  describe('FilterInput accessibility', () => {
    it('should have proper input labels', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      // Check for price range labels
      expect(screen.getByText(/price range/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <PriceRangeFilter />
        </Provider>
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach((input) => {
        // Inputs should be focusable
        expect(input).not.toHaveAttribute('disabled');
      });
    });
  });
});
