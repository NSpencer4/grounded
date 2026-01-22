import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // Schemas may need explicit any for Zod inference
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
