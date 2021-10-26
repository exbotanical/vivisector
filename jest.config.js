module.exports = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	testEnvironment: 'node',
	setupFilesAfterEnv: ['jest-extended', '<rootDir>/__tests__/setup.ts'],
	testRegex: '.test.ts$',
	coverageDirectory: './coverage',
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts'],
	coveragePathIgnorePatterns: ['src/utils/exceptions.ts'],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100
		}
	},
	errorOnDeprecated: true,
	verbose: true
};
