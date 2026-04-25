export default {
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>/../backend/node_modules"],

  // ✅ STRICT ignore
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/e2e/"
  ],

  setupFilesAfterEnv: ["<rootDir>/setup/setup.js"],

  transform: {},
};