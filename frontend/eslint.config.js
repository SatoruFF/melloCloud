import config from 'eslint-config-standard';

/** @type {import('eslint').Linter.Config} */
export default {
  ...config, // Распаковываем конфигурацию "standard"
  extends: [
    ...(config.extends || []), // Добавляем существующие расширения из "standard"
    'plugin:react-hooks/recommended', // Добавляем конфигурацию для React Hooks
  ],
};
