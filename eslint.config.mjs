import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Плоский конфиг ESLint 9.
 *
 * `eslint-config-next` начиная с 16-й версии отдаёт готовые массивы плоского
 * конфига, поэтому FlatCompat не нужен — он на этой связке падает
 * с «Converting circular structure to JSON».
 *
 * Команда тоже изменилась: `next lint` из Next 16 убран, линтуем через `eslint .`.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'src/assets/**',
      'keystatic.config.example.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Заглушки и промежуточные состояния часто держат неиспользуемые
      // аргументы — ругаемся только на те, что не начинаются с подчёркивания.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
