import { renderHook } from '@testing-library/react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useReturnUrl } from './useReturnUrl';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('useReturnUrl', () => {
  const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
  const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FR-047: Return URL Preservation Mechanism', () => {
    it('should extract return URL from location state (primary mechanism)', () => {
      // Arrange: location state has returnUrl
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: { returnUrl: '/search' },
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should return state value
      expect(result.current).toBe('/search');
    });

    it('should fall back to query parameter when state is missing', () => {
      // Arrange: no location state, but query param exists
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=%2Fsmart-search',
        hash: '',
        state: null,
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('returnUrl=%2Fsmart-search'),
        jest.fn(),
      ]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should return decoded query param value
      expect(result.current).toBe('/smart-search');
    });

    it('should prefer location state over query parameter when both exist', () => {
      // Arrange: both state and query param exist
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=%2Fchat',
        hash: '',
        state: { returnUrl: '/search' },
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('returnUrl=%2Fchat'),
        jest.fn(),
      ]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: State takes priority
      expect(result.current).toBe('/search');
    });

    it('should default to "/" when neither state nor query param exist', () => {
      // Arrange: no state, no query param
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should return default "/"
      expect(result.current).toBe('/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle encoded special characters in query parameter', () => {
      // Arrange: query param with encoded characters
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=%2Fsearch%3Ffilter%3Dapartment',
        hash: '',
        state: null,
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('returnUrl=%2Fsearch%3Ffilter%3Dapartment'),
        jest.fn(),
      ]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should decode URL correctly
      expect(result.current).toBe('/search?filter=apartment');
    });

    it('should handle empty string in location state', () => {
      // Arrange: state exists but returnUrl is empty
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: { returnUrl: '' },
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should treat empty string as falsy and default to "/"
      expect(result.current).toBe('/');
    });

    it('should handle undefined state object', () => {
      // Arrange: state is undefined (not just null)
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: undefined,
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should default to "/"
      expect(result.current).toBe('/');
    });

    it('should handle query parameter with leading slash', () => {
      // Arrange: query param already has leading slash
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=/search',
        hash: '',
        state: null,
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('returnUrl=/search'),
        jest.fn(),
      ]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should preserve leading slash
      expect(result.current).toBe('/search');
    });
  });

  describe('FR-031: useReturnUrl Integration with SignInPage', () => {
    it('should support typical protected route redirect flow', () => {
      // Arrange: User was redirected from /search by ProtectedRoute
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=%2Fsearch',
        hash: '',
        state: { returnUrl: '/search' }, // ProtectedRoute sets both
        key: 'test-key',
      });
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('returnUrl=%2Fsearch'),
        jest.fn(),
      ]);

      // Act
      const { result } = renderHook(() => useReturnUrl());

      // Assert: Should extract /search for post-signin redirect
      expect(result.current).toBe('/search');
    });
  });
});
