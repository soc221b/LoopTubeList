/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  // run environment-level setup before any modules load (stubs for jsdom)
  setupFiles: ['<rootDir>/jest.env-setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/jest.fileMock.js'
  },
  testMatch: ['**/tests/**/*.test.{ts,tsx,js}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  // ensure node_modules is ignored by transformers (default) but allow
  // explicit control if specific packages need transforming
  transformIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json'
    }
  },
  collectCoverage: false
};
