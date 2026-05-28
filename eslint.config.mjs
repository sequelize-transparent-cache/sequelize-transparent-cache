import { defineConfig } from 'eslint/config'
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
  pluginPromise.configs['flat/recommended'],
  pluginNode.configs['flat/recommended'],
  pluginJest.configs['flat/recommended'],
  pluginImport.flatConfigs.recommended,
])
