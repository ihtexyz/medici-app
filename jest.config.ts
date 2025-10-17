export default {
  preset: "ts-jest",
  verbose: true,
  silent: true,
  testEnvironment: "jest-environment-jsdom",
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((@wagmi|@tanstack|@rainbow-me|ethers|viem)/.*)\\.js$)",
  ],
  moduleNameMapper: {
    "^#/(.*)": "<rootDir>/src/$1",
    "^.+\\.svg$": "jest-svg-transformer",
    "^.+\\.(css|less|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  modulePaths: ["<rootDir>/src"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
}
