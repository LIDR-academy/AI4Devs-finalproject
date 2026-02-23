#!/usr/bin/env node
/**
 * Convert glTF to ThatOpen Fragments format
 * 
 * Usage:
 *   node convert-gltf-to-fragments.js
 * 
 * Requirements:
 *   npm install @thatopen/components @thatopen/fragments three
 */

const fs = require('fs');
const path = require('path');

// ThatOpen imports (if available)
let FragmentsManager, FragmentIfcLoader;
try {
  const ThatOpen = require('@thatopen/components');
  FragmentsManager = ThatOpen.FragmentsManager;
  FragmentIfcLoader = ThatOpen.FragmentIfcLoader;
} catch (err) {
  console.error('\n❌ @thatopen/components not installed');
  console.error('   Install with: npm install @thatopen/components @thatopen/fragments three\n');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(PROJECT_ROOT, 'dataset', 'fragments', 'temp');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'dataset', 'fragments');
const GLTF_PATH = path.join(TEMP_DIR, 'combined.glb');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'sagrada-sample.frag');

console.log('🚀 glTF → ThatOpen Fragments Converter');
console.log('=' . repeat(60));

// Check input file exists
if (!fs.existsSync(GLTF_PATH)) {
  console.error(`\n❌ Input glTF not found: ${GLTF_PATH}`);
  console.error('   Run: python exporters/export_thatopen_frag.py first\n');
  process.exit(1);
}

console.log(`\n📂 Input:  ${GLTF_PATH}`);
console.log(`📂 Output: ${OUTPUT_PATH}\n`);

async function convertGltfToFragments() {
  try {
    // Note: ThatOpen Fragments typically work with IFC files
    // For pure glTF, we need a different approach
    
    console.log('⚠️  ThatOpen Fragments are optimized for IFC workflows');
    console.log('   For glTF comparison, we recommend using the glTF+Draco format directly');
    console.log('   in the Three.js viewers.\n');
    
    console.log('📝 Alternative approaches:');
    console.log('   1. Convert Rhino → IFC → Fragments (full BIM workflow)');
    console.log('   2. Use glTF directly with ThatOpen\'s glTF loader');
    console.log('   3. Manually create Fragment from glTF geometry (complex)\n');
    
    console.log('💡 For this POC, the comparison will focus on:');
    console.log('   - glTF+Draco (already exported)');
    console.log('   - ThatOpen workflow (if IFC files available)');
    console.log('   - Custom Fragment creation (advanced, optional)\n');
    
    // Placeholder: If we had IFC files, we'd do:
    // const fragments = new FragmentsManager();
    // const loader = new FragmentIfcLoader(fragments);
    // await loader.load(ifcPath);
    // await fragments.export('sagrada-sample.frag');
    
    console.log('✅ For POC purposes, proceed with glTF+Draco format');
    console.log('   (ThatOpen evaluation requires IFC source files)\n');
    
  } catch (err) {
    console.error('\n❌ Conversion failed:', err.message);
    process.exit(1);
  }
}

// Run
convertGltfToFragments()
  .then(() => {
    console.log('✅ Process completed');
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
