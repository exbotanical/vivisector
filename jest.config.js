module.exports = {
	setupFilesAfterEnv: ['jest-extended', '<rootDir>/__tests__/setup.ts'],
	testRegex: '.test.ts$',
	coverageDirectory: './coverage',
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts'],
	coveragePathIgnorePatterns: [
		'src/utils/exceptions.ts',
		'src/utils/validators.ts'
	],
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 75,
			lines: 75,
			statements: 75
		}
	},
	errorOnDeprecated: true,
	verbose: true
};
