// ESLint flat config (ESLint 9) — usado directamente por `eslint .`
// (`next lint` quedó deprecado en Next 15 y se retira en Next 16).
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // `next lint` ignoraba estos directorios/ficheros generados por defecto;
  // `eslint .` (flat config) no tiene ese comportamiento implícito.
  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      ".next/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
