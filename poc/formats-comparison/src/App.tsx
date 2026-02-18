/**
 * App.tsx - POC Entry Point
 * 
 * Main application for format comparison POC.
 */

import React from 'react';
import { ComparisonView } from './viewers/ComparisonView';

// Test dataset files (update paths after export)
const GLTF_FILES = [
  '/dataset/gltf-draco/capitel-001-instance-1.glb',
  '/dataset/gltf-draco/capitel-001-instance-2.glb',
  '/dataset/gltf-draco/capitel-001-instance-3.glb',
  '/dataset/gltf-draco/capitel-001-instance-4.glb',
  '/dataset/gltf-draco/capitel-001-instance-5.glb',
  '/dataset/gltf-draco/columna-A.glb',
  '/dataset/gltf-draco/columna-B.glb',
  '/dataset/gltf-draco/columna-C.glb',
  '/dataset/gltf-draco/dovela-001.glb',
  '/dataset/gltf-draco/dovela-002.glb',
];

const FRAGMENTS_FILES = [
  '/dataset/fragments/sagrada-sample.frag',
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ComparisonView 
        gltfFiles={GLTF_FILES}
        fragmentsFiles={FRAGMENTS_FILES}
      />
    </div>
  );
}

export default App;
