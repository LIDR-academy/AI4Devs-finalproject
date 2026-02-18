/**
 * GltfDracoViewer Component
 * 
 * Three.js viewer for glTF+Draco files with integrated benchmarking.
 * Uses @react-three/fiber and @react-three/drei.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Stats } from '@react-three/drei';
import { useBenchmark, formatMetrics } from '../hooks/useBenchmark';
import * as THREE from 'three';

interface GltfDracoViewerProps {
  files: string[];  // URLs to .glb files
  onMetricsUpdate?: (metrics: any) => void;
}

// Scene component with models
function Scene({ files, onLoad }: { files: string[]; onLoad: () => void }) {
  const { gl } = useThree();
  const [models, setModels] = useState<any[]>([]);
  const loadedCount = useRef(0);
  
  useEffect(() => {
    const loadModels = async () => {
      const loadedModels: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const { scene } = await useGLTF.preload(files[i]);
          
          // Position models in grid
          const gridSize = Math.ceil(Math.sqrt(files.length));
          const spacing = 5;
          const x = (i % gridSize) * spacing;
          const z = Math.floor(i / gridSize) * spacing;
          
          scene.position.set(x, 0, z);
          loadedModels.push(scene);
          
          loadedCount.current++;
          
          if (loadedCount.current === files.length) {
            onLoad();
          }
        } catch (error) {
          console.error(`Failed to load ${files[i]}:`, error);
        }
      }
      
      setModels(loadedModels);
    };
    
    loadModels();
  }, [files, onLoad]);
  
  // Update draw calls metrics
  useEffect(() => {
    if (!gl || models.length === 0) return;
    
    const interval = setInterval(() => {
      const info = gl.info;
      console.log('Draw calls:', info.render.calls);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gl, models]);
  
  return (
    <>
      {models.map((model, idx) => (
        <primitive key={idx} object={model} />
      ))}
    </>
  );
}

export function GltfDracoViewer({ files, onMetricsUpdate }: GltfDracoViewerProps) {
  const {
    metrics,
    startBenchmark,
    measureParse,
    measureDrawCalls,
    updateGeometryStats,
    markFirstRender,
  } = useBenchmark({
    format: 'gltf-draco',
    filesUrls: files,
    onMetricsUpdate,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parseStartRef = useRef<number>(0);
  
  useEffect(() => {
    // Start benchmark when component mounts
    startBenchmark();
    parseStartRef.current = performance.now();
  }, [startBenchmark]);
  
  const handleSceneLoad = () => {
    const parseEnd = performance.now();
    measureParse(parseStartRef.current, parseEnd);
    markFirstRender();
  };
  
  const formattedMetrics = formatMetrics(metrics);
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        camera={{ position: [15, 15, 15], fov: 50 }}
        style={{ background: '#1a1a1a' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* Grid */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellColor="#6f6f6f"
          sectionSize={10}
          sectionColor="#9d4b4b"
          fadeDistance={50}
          fadeStrength={1}
        />
        
        {/* Models */}
        <Scene files={files} onLoad={handleSceneLoad} />
        
        {/* Controls */}
        <OrbitControls makeDefault />
        
        {/* Stats */}
        <Stats />
      </Canvas>
      
      {/* Metrics Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        pointerEvents: 'none',
        minWidth: '200px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
          📊 glTF+Draco Metrics
        </div>
        
        {metrics.isLoading ? (
          <div>⏳ Loading...</div>
        ) : (
          <>
            <div><strong>Network:</strong></div>
            <div>  Payload: {formattedMetrics.payload}</div>
            <div>  Download: {formattedMetrics.download}</div>
            
            <div style={{ marginTop: '10px' }}><strong>Parse:</strong></div>
            <div>  Time: {formattedMetrics.parse}</div>
            <div>  TTFR: {formattedMetrics.ttfr}</div>
            
            <div style={{ marginTop: '10px' }}><strong>Runtime:</strong></div>
            <div>  Memory: {formattedMetrics.memory}</div>
            <div>  FPS: {formattedMetrics.fps}</div>
            <div>  Draw Calls: {formattedMetrics.drawCalls}</div>
            <div>  Triangles: {formattedMetrics.triangles}</div>
          </>
        )}
        
        {metrics.error && (
          <div style={{ color: '#ff6b6b', marginTop: '10px' }}>
            ❌ {metrics.error}
          </div>
        )}
      </div>
      
      {/* Format Label */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: '#3B82F6',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        glTF + Draco
      </div>
    </div>
  );
}

// Preload utility
export function preloadGltfModels(urls: string[]) {
  urls.forEach(url => {
    useGLTF.preload(url);
  });
}
