import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/', 'reports/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['tests/**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-eval': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              allowTypeImports: true,
              message: "Import { test, expect } from '@/support/fixtures/test' so page objects are fixtures.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ['support/pages/**/*.ts'],
    plugins: { playwright },
    rules: {
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-element-handle': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['expect', 'test'],
              message: 'Page objects expose locators and actions; assertions belong in specs.',
            },
          ],
        },
      ],
    },
  },

  prettier,
);
