/* eslint-disable no-console */
import { jest } from '@jest/globals';
import { CacheService } from '../src/services/cache';

jest.setTimeout(30000);

// Suppress console logs during tests for cleaner output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress winston logger output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(async () => {
  // Cleanup cache service connections
  try {
    await CacheService.cleanup();
  } catch (error) {
    console.error('Failed to cleanup cache service', { error });
  }

  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;

  // Force cleanup of any remaining async operations
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Global cleanup for each test
afterEach(async () => {
  // Clear any timers
  jest.clearAllTimers();

  // Wait for any pending promises
  await new Promise((resolve) => setImmediate(resolve));
});
