import coreWebVitals from "eslint-config-next/core-web-vitals";
import next from "eslint-config-next/typescript";

// Next 16 exporta flat config nativo (arrays) — sin FlatCompat.
const eslintConfig = [
  ...coreWebVitals,
  ...next,
  {
    rules: {
      // Convención del proyecto: args/vars con prefijo `_` son intencionadamente
      // no usados (p. ej. params de firma que aún no se consumen).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "src/generated/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default eslintConfig;
