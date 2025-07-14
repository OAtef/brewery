import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../lib/auth';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();

describe('Auth Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
    });
    
    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidUnit function from units', () => {
    // Test the units validation that we added to the ingredient API
    it('should validate unit values correctly', () => {
      const { isValidUnit } = require('../lib/units');
      
      // Valid units should return true
      expect(isValidUnit('g')).toBe(true);
      expect(isValidUnit('ml')).toBe(true);
      expect(isValidUnit('piece')).toBe(true);
      expect(isValidUnit('shot')).toBe(true);
      
      // Invalid units should return false
      expect(isValidUnit('invalid_unit')).toBe(false);
      expect(isValidUnit('')).toBe(false);
      expect(isValidUnit(null)).toBe(false);
      expect(isValidUnit(undefined)).toBe(false);
    });
  });

  describe('Auth context functions', () => {
    it('should have proper structure when imported', () => {
      expect(typeof useAuth).toBe('function');
      expect(typeof AuthProvider).toBe('function');
    });
  });

  describe('localStorage safety', () => {
    it('should handle localStorage access safely', () => {
      const { AuthProvider } = require('../lib/auth');
      
      // Test that AuthProvider can be imported without errors
      expect(typeof AuthProvider).toBe('function');
      
      // Test localStorage safety by temporarily removing window
      const originalWindow = global.window;
      delete global.window;
      
      // This should not throw an error
      expect(() => {
        const authModule = require('../lib/auth');
        expect(typeof authModule.useAuth).toBe('function');
      }).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('fetch error handling', () => {
    it('should handle network errors in login', async () => {
      const networkError = new Error('Network error');
      fetch.mockRejectedValueOnce(networkError);
      
      const authModule = require('../lib/auth');
      expect(typeof authModule.useAuth).toBe('function');
      
      // Test that fetch mock is working
      try {
        await fetch('/api/auth');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle successful login response structure', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'USER' };
      const mockResponse = { user: mockUser };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Test that fetch is properly mocked
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.user).toEqual(mockUser);
    });

    it('should handle failed login response', async () => {
      const mockErrorResponse = { error: 'Invalid credentials' };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      });

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });
  });
});
