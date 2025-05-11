import config from 'eslint-config-standard';

/** @type {import('eslint').Linter.Config} */
export default {
  ...config, // extend standart
  env: {
    browser: true,
    es2021: true,
    ...(config.env || {}),
  },
  extends: [
    ...(config.extends || []), // Stardant extends
    'plugin:react/recommended',
    'airbnb',
    'plugin:i18next/recommended',
    'plugin:storybook/recommended',
    'plugin:react-hooks/recommended', // Support React Hooks
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    ...new Set([...(config.plugins || []), 'react', '@typescript-eslint']), // Unset duplicates
  ],
  rules: {
    ...config.rules, // Extend common rules
    'no-console': "error",
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
    'i18next/no-literal-string': [
      'error',
      {
        markupOnly: true,
        ignoreAttribute: ['data-testid', 'to', 'target'],
      },
    ],
  },
};
