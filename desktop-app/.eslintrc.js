module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Allow require() in Node.js files
    '@typescript-eslint/no-var-requires': 'off',
    'no-undef': 'off',
  },
  overrides: [
    {
      files: ['build-safe.js', 'verify-build.js', 'test-build.js', 'src/main.js'],
      rules: {
        // Allow CommonJS require in build scripts and main process
        'import/no-commonjs': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-unused-vars': 'warn',
      },
    },
  ],
};