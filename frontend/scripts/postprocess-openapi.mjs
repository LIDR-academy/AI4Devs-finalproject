/**
 * Post-process generated OpenAPI files
 * Adds // @ts-nocheck to skip TypeScript strict checks on auto-generated code
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addTsNoCheck(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await addTsNoCheck(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      const content = await readFile(fullPath, 'utf-8');
      
      // Skip if already has @ts-nocheck
      if (content.includes('@ts-nocheck')) {
        continue;
      }
      
      // Add @ts-nocheck at the top
      const newContent = `// @ts-nocheck\n${content}`;
      await writeFile(fullPath, newContent, 'utf-8');
      console.log(`✓ Added @ts-nocheck to ${entry.name}`);
    }
  }
}

// Process both generated directories
const projectRoot = join(__dirname, '..');
const compositionDir = join(projectRoot, 'src/api/generated/composition/src');
const generationDir = join(projectRoot, 'src/api/generated/generation/src');

console.log('Post-processing generated OpenAPI files...\n');

Promise.all([
  addTsNoCheck(compositionDir),
  addTsNoCheck(generationDir),
])
  .then(() => {
    console.log('\n✅ All generated files processed successfully');
  })
  .catch((error) => {
    console.error('❌ Error processing files:', error);
    process.exit(1);
  });
