/* eslint-disable no-console */
import { jest } from '@jest/globals';

jest.setTimeout(30000);

// Suppress console logs during tests for cleaner output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress winston logger output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
