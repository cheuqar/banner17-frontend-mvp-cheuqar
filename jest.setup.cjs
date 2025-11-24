require('@testing-library/jest-dom');

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

global.localStorage = localStorageMock;

// Mock import.meta.env for Vite (doesn't work with import.meta syntax, handled by Babel plugin)
// The babel-plugin-transform-import-meta will handle the transformation

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
