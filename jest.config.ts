export default {
    clearMocks: true,
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['examples/todo/canvas'],
};
