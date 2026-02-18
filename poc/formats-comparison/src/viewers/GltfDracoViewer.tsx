/**
 * GltfDracoViewer Component
 * 
 * Three.js viewer for glTF+Draco files with integrated benchmarking.
 * Uses @react-three/fiber and @react-three/drei.
 */

import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Stats } from '@react-three/drei';
import { useBenchmark, formatMetrics } from '../hooks/useBenchmark';
import * as THREE from 'three';

interface GltfDracoViewerProps {
  files: string[];  // URLs to .glb files
  onMetricsUpdate?: (metrics: any) => void;
}

// Individual model component
function Model({ url }: { url: string }) {
  console.log('Loading model:', url);
  const gltf = useGLTF(url);
  const { camera, controls } = useThree();
  
  useEffect(() => {
    console.log('Model loaded:', gltf);
    if (gltf.scene) {
      // Rhino Z-up → glTF Y-up: Rotate -90° on X axis
      gltf.scene.rotation.x = -Math.PI / 2;
      
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      console.log('Model bounds:', box);
      console.log('Model center:', center);
      console.log('Model size:', size);
      
      // Center camera on model
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // Add some padding
      
      // Position camera
      camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
      camera.lookAt(center);
      
      // Update controls target
      if (controls) {
        (controls as any).target.copy(center);
        (controls as any).update();
      }
      
      // Add basic material if missing
      gltf.scene.traverse((child: any) => {
        if (child.isMesh && !child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        }
      });
    }
  }, [gltf, camera, controls]);
  
  return <primitive object={gltf.scene} />;
}

// Loading fallback
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
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
    
    // Mark as loaded after delay
    const timer = setTimeout(() => {
      const parseEnd = performance.now();
      measureParse(parseStartRef.current, parseEnd);
      markFirstRender();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [startBenchmark, measureParse, markFirstRender]);
  
  const formattedMetrics = formatMetrics(metrics);
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ background: '#1a1a1a' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
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
        
        {/* Model with Suspense */}
        <Suspense fallback={<Loader />}>
          {files.map((file) => (
            <Model key={file} url={file} />
          ))}
        </Suspense>
        
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
