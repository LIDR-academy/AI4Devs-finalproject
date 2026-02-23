/**
 * App.tsx - POC Entry Point
 * 
 * Main application for format comparison POC.
 */

import React from 'react';
import { GltfDracoViewer } from './viewers/GltfDracoViewer';

// Test dataset files (real exported file)
const GLTF_FILES = [
  '/gltf-draco/test-model-big.glb',
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f0f0f' }}>
      <div style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #3B82F6',
      }}>
        <h1 style={{
          color: 'white',
          margin: 0,
          fontFamily: 'sans-serif',
          fontSize: '24px',
        }}>
          🚀 POC: glTF+Draco Viewer - Sagrada Família
        </h1>
      </div>
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <GltfDracoViewer 
          files={GLTF_FILES}
          onMetricsUpdate={(metrics) => console.log('Metrics:', metrics)}
        />
      </div>
    </div>
  );
}

export default App;
