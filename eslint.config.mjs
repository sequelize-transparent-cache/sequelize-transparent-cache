import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginPromise from 'eslint-plugin-promise'
import pluginNode from 'eslint-plugin-n'
import pluginJest from 'eslint-plugin-jest'
import pluginImport from 'eslint-plugin-import'

export default defineConfig([
  {
    ignores: ['coverage/*', 'examples/*'],
  },
  eslintConfigPrettier,
  {
    files: ['packages/**/*.js'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
    extends: [
      js.configs['recommended'],
      pluginPromise.configs['flat/recommended'],
      pluginNode.configs['flat/recommended'],
      pluginJest.configs['flat/recommended'],
      pluginImport.flatConfigs.recommended,
    ],
  },
  {
    files: ['packages/**/__test__/**/*.js'],
    rules: { 'n/no-unpublished-require': 'off' },
  },
])
