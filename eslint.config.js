// @ts-check
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist/", ".astro/", "node_modules/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    // Exercise starter code ships as stubs whose parameters are not used yet.
    files: ["exercises/frontend/**/src/**/*.{ts,tsx}"],
    ignores: ["exercises/frontend/**/solution/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    },
  },
  eslintConfigPrettier,
);
