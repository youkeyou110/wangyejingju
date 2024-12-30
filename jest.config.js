module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/popup/js/$1'
  },
  collectCoverageFrom: [
    'popup/js/**/*.js',
    '!popup/js/vendor/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/e2e/'
  ]
};
