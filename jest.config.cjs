module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^../src/services/crawling$':
      '<rootDir>/tests/__mocks__/services/crawling.ts',
    '^../src/services/accessibility$':
      '<rootDir>/tests/__mocks__/services/accessibility.ts',
    '^../services/crawling$': '<rootDir>/tests/__mocks__/services/crawling.ts',
    '^../services/accessibility$':
      '<rootDir>/tests/__mocks__/services/accessibility.ts',
  },
};
