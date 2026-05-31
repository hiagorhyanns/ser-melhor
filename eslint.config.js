import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  // Pastas que o ESLint deve ignorar inteiramente
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'build/**', '*.config.js'],
  },

  // Regras base recomendadas pelo proprio ESLint
  js.configs.recommended,

  // Regras recomendadas para TypeScript
  ...tseslint.configs.recommended,

  // Regras especificas para arquivos React (TS/TSX)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // React 17+ JSX transform
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Ajustes pragmaticos para o projeto atual
      'react/prop-types': 'off', // usamos TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
