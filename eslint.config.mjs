import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginPromise from 'eslint-plugin-promise'
import pluginNode from 'eslint-plugin-n'

export default defineConfig([
  {
    files: ['**/*.js'],
  },
  {
    ignores: ['coverage/*'],
  },
  eslintConfigPrettier,
  pluginPromise.configs['flat/recommended'],
  pluginNode.configs['flat/recommended'],
])
