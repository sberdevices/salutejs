import type { Config } from '@jest/types';
import path from 'path';
import { lstatSync, readdirSync } from 'fs';

const basePath = path.resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name) => lstatSync(path.join(basePath, name)).isDirectory());

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/**/src/**/*.spec.{ts,js}'],
    moduleNameMapper: {
        ...packages.reduce(
            (acc, name) => ({
                ...acc,
                [`@salutejs/${name}(.*)$`]: `<rootDir>/packages/./${name}/src/$1`,
            }),
            {},
        ),
    },
    modulePathIgnorePatterns: [...packages.reduce((acc, name) => [...acc, `<rootDir>/packages/${name}/dist`], [])],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;
