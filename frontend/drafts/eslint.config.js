import config from 'eslint-config-standard';

/** @type {import('eslint').Linter.Config} */
export default {
  ...config, // Наследуем конфигурацию "standard"
  env: {
    browser: true,
    es2021: true,
    ...(config.env || {}),
  },
  extends: [
    ...(config.extends || []), // Подключаем стандартные расширения
    'plugin:react/recommended',
    'airbnb',
    'plugin:i18next/recommended',
    'plugin:storybook/recommended',
    'plugin:react-hooks/recommended', // Добавляем поддержку React Hooks
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
    ...new Set([...(config.plugins || []), 'react', '@typescript-eslint']), // Убираем дубликаты
  ],
  rules: {
    ...config.rules, // Наследуем стандартные правила
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off', // Убираем преференцию для default export
    'i18next/no-literal-string': [
      'error',
      {
        markupOnly: true,
        ignoreAttribute: ['data-testid', 'to', 'target'],
      },
    ],
  },
};
