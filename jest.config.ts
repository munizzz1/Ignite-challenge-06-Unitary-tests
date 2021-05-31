import { pathsToModuleNameMapper } from 'ts-jest/utils';
import { compilerOptions } from './tsconfig.json';

export default {
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/modules/**/useCases/**/*Controller.ts',
    '<rootDir>/src/modules/**/useCases/**/*UseCase.ts',
  ],
  coverageDirectory: 'converage',
  coverageProvider: "v8",
  coverageReporters: [
    "text-summary",
    "lcov",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
};
