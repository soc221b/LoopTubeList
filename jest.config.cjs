/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/jest.fileMock.js'
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
  collectCoverage: false
};
