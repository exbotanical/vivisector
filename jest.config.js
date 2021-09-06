module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    "^.+\\.js$": "babel-jest",

  },
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    'jest-extended',
    '<rootDir>/__tests__/setup.js'
  ],
  testRegex: '.test.js$',
  coverageDirectory: './coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.ts'
  ],
	coveragePathIgnorePatterns: [
		"lib/utils/exceptions.ts"
	],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  errorOnDeprecated: true,
  verbose: true
};
