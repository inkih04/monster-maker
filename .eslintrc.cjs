module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  parser: '@typescript-eslint/parser',

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',                    // Desactiva todas las reglas de estilo
  ],

  plugins: [
    '@typescript-eslint',
    'react-refresh',
  ],

  ignorePatterns: ['dist', 'dist-electron', '.eslintrc.cjs'],

  rules: {
    // --- Siguen reglas útiles ---
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'off',
    'no-undef': 'off',

    // Permitir require en main.ts de electron
    '@typescript-eslint/no-var-requires': 'off',

    // React-refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // --- Desactivamos reglas molestas ---
    'import/order': 'off',
    'sort-imports': 'off',
    'no-console': 'off',
    'no-debugger': 'warn',

    // Desactivar cualquier regla "estética"
    'spaced-comment': 'off',
    'no-multiple-empty-lines': 'off',
    'padding-line-between-statements': 'off',
  },
};
