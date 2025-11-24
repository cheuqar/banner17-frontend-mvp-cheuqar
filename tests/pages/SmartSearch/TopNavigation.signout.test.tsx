/**
 * TopNavigation Sign Out Tests - Phase 6
 *
 * Tests for FR-011 and FR-048: Sign out functionality with return URL preservation
 *
 * Test Coverage:
 * - Sign out redirects to /sign-in with current page as returnUrl
 * - Return URL properly encodes complex paths and query parameters
 * - AuthContext.signOut() is called correctly
 * - Profile panel closes before redirect
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TopNavigation from '../../../src/pages/SmartSearch/components/TopNavigation';
import { useAuth } from '../../../src/contexts/AuthContext';
import searchFiltersReducer from '../../../src/store/slices/searchFilters';
import smartSearchReducer from '../../../src/store/slices/smartSearchSlice';

// Mock dependencies
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock window.location
delete (window as any).location;
window.location = {
  href: '',
  pathname: '/search',
  search: '',
  hash: '',
  origin: 'http://localhost:3301',
} as any;

describe('TopNavigation - Sign Out Functionality (FR-011, FR-048)', () => {
  const mockSignOut = jest.fn();

  const createTestStore = () => {
    return configureStore({
      reducer: {
        searchFilters: searchFiltersReducer,
        smartSearch: smartSearchReducer,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);

    // Reset window.location
    window.location.href = '';
    window.location.pathname = '/search';
    window.location.search = '';

    // Default authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: '123', email: 'test@example.com', email_confirmed_at: '2025-01-15T12:00:00Z' },
      signOut: mockSignOut,
    });
  });

  describe('FR-011: Sign Out Redirects to Sign In Page', () => {
    it('should redirect to /sign-in after sign out', async () => {
      // Arrange
      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      // Wait for panel to open
      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      // Act: Click sign out
      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Redirect to /sign-in with returnUrl
      await waitFor(() => {
        expect(window.location.href).toMatch(/^\/sign-in\?returnUrl=/);
      });
    });

    it('should call AuthContext.signOut() before redirect', async () => {
      // Arrange
      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and click sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: signOut called
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('FR-048: Return URL Preservation', () => {
    it('should preserve current page path as returnUrl', async () => {
      // Arrange: User on /search page
      window.location.pathname = '/search';
      window.location.search = '';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Return URL includes /search
      await waitFor(() => {
        expect(window.location.href).toContain('returnUrl=%2Fsearch');
      });
    });

    it('should preserve query parameters in returnUrl', async () => {
      // Arrange: User on /search with filters
      window.location.pathname = '/search';
      window.location.search = '?propertyType=house&bedrooms=3';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Return URL includes path and query params (encoded)
      await waitFor(() => {
        const expectedReturnUrl = encodeURIComponent('/search?propertyType=house&bedrooms=3');
        expect(window.location.href).toContain(`returnUrl=${expectedReturnUrl}`);
      });
    });

    it('should properly encode complex returnUrl with special characters', async () => {
      // Arrange: Complex URL with special characters
      window.location.pathname = '/smart-search';
      window.location.search = '?location=Sydney%20CBD&price=500000-1000000';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Return URL properly encoded
      await waitFor(() => {
        expect(window.location.href).toMatch(/\/sign-in\?returnUrl=/);
        // Should contain encoded version of the path + query
        expect(decodeURIComponent(window.location.href)).toContain('/smart-search?location=Sydney%20CBD');
      });
    });

    it('should handle paths without query parameters', async () => {
      // Arrange: Simple path without query params
      window.location.pathname = '/smart-search';
      window.location.search = '';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Return URL is just the path
      await waitFor(() => {
        expect(window.location.href).toContain('returnUrl=%2Fsmart-search');
      });
    });
  });

  describe('User Profile Panel Integration', () => {
    it('should close profile panel before redirect', async () => {
      // Arrange
      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      // Act: Click sign out
      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Panel should close (sign out button should disappear)
      await waitFor(() => {
        expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Sign Out Error Handling', () => {
    it('should handle signOut errors gracefully', async () => {
      // Arrange: signOut throws error
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and click sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Should still attempt signOut
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('FR-042: AuthContext NOT Modified', () => {
    it('should use existing AuthContext.signOut without modifications', async () => {
      // Arrange
      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: signOut called with no arguments (original signature)
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith();
      });
    });

    it('should NOT pass returnUrl to AuthContext.signOut', async () => {
      // Arrange: This test verifies we don't modify AuthContext API
      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Open profile panel and sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: signOut called with zero arguments per FR-042
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
        expect(mockSignOut).toHaveBeenCalledWith(); // No arguments
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should support full sign out → sign in → return flow', async () => {
      // This test verifies the complete flow per FR-048:
      // 1. User on /search signs out
      // 2. Redirected to /sign-in?returnUrl=/search
      // 3. After sign in, useReturnUrl extracts /search
      // 4. User redirected back to /search

      // Arrange: User on /search
      window.location.pathname = '/search';
      window.location.search = '';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Act: Sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: Step 2 - Redirected to /sign-in?returnUrl=/search
      await waitFor(() => {
        expect(window.location.href).toBe('/sign-in?returnUrl=%2Fsearch');
      });

      // Steps 3-4 handled by SignInPage + useReturnUrl (tested separately)
    });

    it('should preserve filters when signing out from /search page', async () => {
      // Arrange: User on /search with active filters
      window.location.pathname = '/search';
      window.location.search = '?suburb=Mosman&propertyType=apartment&bedrooms=2&priceMax=1000000';

      const store = createTestStore();
      render(
        <Provider store={store}>
          <TopNavigation />
        </Provider>
      );

      // Act: Sign out
      const profileButton = screen.getByLabelText(/user profile menu/i);
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      // Assert: All filters preserved in returnUrl
      await waitFor(() => {
        const expectedReturnUrl = encodeURIComponent('/search?suburb=Mosman&propertyType=apartment&bedrooms=2&priceMax=1000000');
        expect(window.location.href).toContain(`returnUrl=${expectedReturnUrl}`);
      });
    });
  });
});
