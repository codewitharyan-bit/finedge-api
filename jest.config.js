module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/models/**'
  ]
};
