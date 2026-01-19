import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import js from '@eslint/js'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  js.configs.recommended,
  eslintPluginPrettierRecommended,
)
