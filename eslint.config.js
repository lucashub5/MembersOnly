import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    env: {
      node: true,
    },
    plugins: {
      prettier: prettierPlugin,
    },
    extends: [
      'eslint:recommended',
    ]
  },
];
