import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['functions/**'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React 19 + @vitejs/plugin-react 6 usan el JSX transform automatico
      // (src/main.jsx no importa React). Esta regla es del transform antiguo
      // y el propio plugin la deprecó; aqui solo genera ruido.
      'react/react-in-jsx-scope': 'off',

      // El proyecto es JavaScript sin TypeScript y no declara propTypes en
      // ningun componente. La regla no aporta senal sobre convenciones que el
      // codigo no sigue, y solo produce 187 errores sin valor accionable.
      'react/prop-types': 'off',
    },
  },
  // Los tests corren en Node (vitest/node:test), no en el navegador:
  // sin esto `setImmediate` y similares se marcan como no definidos.
  {
    files: ['**/*.test.{js,jsx}', 'src/test-support/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // functions/ es un proyecto Node CommonJS con su propio package.json:
  // sin esto `require`/`exports`/`process` se marcan como no definidos.
  {
    files: ['functions/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^event$', varsIgnorePattern: '^_' }],
    },
  },
])
