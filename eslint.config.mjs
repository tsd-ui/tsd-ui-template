import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config([
  globalIgnores(["**/dist", "**/coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      prettierRecommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./common/tsconfig.json", "./client/tsconfig.node.json", "./client/tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-function": ["off"],
      "react/prop-types": "off",
      "prettier/prettier": [
        "warn",
        {
          singleQuote: false,
        },
      ],
      "@typescript-eslint/no-unsafe-assignment": ["warn"],
    },
    settings: { react: { version: "19" } },
    ignores: ["client/types/**"],
  },
]);
