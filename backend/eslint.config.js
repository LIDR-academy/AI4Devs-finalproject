export default [
  {
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    rules: {
      indent: ["error", 2],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "single"],
      semi: ["error", "always"]
    },
    env: {
      browser: true,
      es2021: true
    },
    extends: "eslint:recommended"
  }
];