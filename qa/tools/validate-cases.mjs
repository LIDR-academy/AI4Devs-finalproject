#!/usr/bin/env node
/**
 * Validates a case-bundle JSON file against the case-bundle JSON Schema using AJV.
 * Usage: node validate-cases.mjs <bundlePath> <schemaPath>
 * Exit 0 if valid; exit 1 and print errors otherwise.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv/dist/2020.js';

const [bundlePath, schemaPath] = process.argv.slice(2);

if (!bundlePath || !schemaPath) {
  console.error('Usage: node validate-cases.mjs <bundlePath> <schemaPath>');
  process.exit(1);
}

const bundleAbs = resolve(process.cwd(), bundlePath);
const schemaAbs = resolve(process.cwd(), schemaPath);

let bundle;
let schema;

try {
  bundle = JSON.parse(readFileSync(bundleAbs, 'utf8'));
} catch (err) {
  console.error(`Failed to read or parse bundle: ${bundlePath}`);
  console.error(err.message);
  process.exit(1);
}

try {
  schema = JSON.parse(readFileSync(schemaAbs, 'utf8'));
} catch (err) {
  console.error(`Failed to read or parse schema: ${schemaPath}`);
  console.error(err.message);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const valid = validate(bundle);

const caseCount = Array.isArray(bundle.cases) ? bundle.cases.length : 0;

if (valid) {
  console.log('Valid');
  console.log(`Cases validated: ${caseCount}`);
  process.exit(0);
}

console.error('Validation failed');
console.error(`Cases validated: ${caseCount}`);
for (const e of validate.errors) {
  console.error(`  instancePath: ${e.instancePath || '(root)'}`);
  console.error(`  keyword: ${e.keyword}`);
  console.error(`  message: ${e.message || ''}`);
}
process.exit(1);
