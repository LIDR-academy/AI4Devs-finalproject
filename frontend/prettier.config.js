/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: "avoid",
  endOfLine: "lf",
  jsxSingleQuote: true,
  bracketSameLine: false,
  plugins: ["prettier-plugin-tailwindcss"],
}
