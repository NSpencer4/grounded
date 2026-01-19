import globals from 'globals';
import { defineConfig } from 'eslint/config';

import baseConfig from "../../../eslint.config.js";

export default defineConfig([
  {
    extends: [baseConfig],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-undef': 'off',
    },
  }
]);
