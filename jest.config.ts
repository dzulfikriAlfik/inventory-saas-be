import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/test"],
  setupFiles: ["<rootDir>/src/test/setup/env.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup/integration.ts"],
  testMatch: ["**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["src/**/*.ts", "!src/test/**", "!src/types/**"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"]
};

export default config;
