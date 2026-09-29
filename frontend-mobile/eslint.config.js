// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Expo 57 + React 19 flags the existing data-loading effects across
      // the app; these effects synchronize remote API state by design.
      "react-hooks/set-state-in-effect": "off",
    },
  }
]);
