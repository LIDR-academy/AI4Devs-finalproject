// ESLint flat config — used by eslint CLI directly.
// Next.js 14 uses .eslintrc.json via `next lint`; this file is kept
// for tooling compatibility and future migration to Next.js 15+.
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
