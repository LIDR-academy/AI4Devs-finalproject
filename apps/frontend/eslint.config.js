import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Marca el patron estandar `setIsLoading(true)` al inicio de un efecto de fetch
      // (App.tsx, ReportsDashboard.tsx). Corregirlo de verdad implica reestructurar el
      // flujo de carga de datos, no un fix mecanico de lint — decision deliberada, no omision.
      'react-hooks/set-state-in-effect': 'off',
      // Informativas (TK-036): deuda preexistente medida en 14 archivos, sobre todo
      // componentes donde JSX infla el conteo de lineas. No bloquean pnpm run lint
      // hasta que se pague esa deuda — mismo criterio que Mutation Testing.
      complexity: ['warn', 10],
      'max-lines-per-function': ['warn', 60],
      'max-depth': ['warn', 4],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
      'max-depth': 'off',
    },
  }
);
