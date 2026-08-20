import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'reports/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Informativas (TK-036): deuda preexistente medida en 13 archivos. No bloquean
      // pnpm run lint hasta que se pague esa deuda — mismo criterio que Mutation Testing.
      complexity: ['warn', 10],
      'max-lines-per-function': ['warn', 60],
      'max-depth': ['warn', 4],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
      'max-depth': 'off',
    },
  }
);
