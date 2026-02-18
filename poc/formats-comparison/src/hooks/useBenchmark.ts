/**
 * useBenchmark Hook
 * 
 * Provides real-time performance metrics for 3D viewers:
 * - Network: Payload size, download time
 * - Parse: Deserialization time, worker usage
 * - Runtime: FPS, memory, draw calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface BenchmarkMetrics {
  // Network
  payloadSize: number;        // Bytes
  downloadTime: number;       // ms
  compressionRatio: number;   // % vs original
  
  // Parse
  parseTime: number;          // ms
  mainThreadBlocked: number;  // ms
  workerTime: number;         // ms
  timeToFirstRender: number;  // ms
  
  // Runtime
  memoryUsage: number;        // MB
  fps: number;                // Frames per second
  drawCalls: number;          // Draw calls per frame
  instancedMeshes: number;    // Number of instanced meshes
  geometryCount: number;      // Unique geometries
  triangleCount: number;      // Total triangles rendered
  
  // Status
  isLoading: boolean;
  error: string | null;
}

interface UseBenchmarkOptions {
  format: 'gltf-draco' | 'thatopen-fragments';
  filesUrls: string[];
  onMetricsUpdate?: (metrics: BenchmarkMetrics) => void;
}

export function useBenchmark({ format, filesUrls, onMetricsUpdate }: UseBenchmarkOptions) {
  const [metrics, setMetrics] = useState<BenchmarkMetrics>({
    payloadSize: 0,
    downloadTime: 0,
    compressionRatio: 0,
    parseTime: 0,
    mainThreadBlocked: 0,
    workerTime: 0,
    timeToFirstRender: 0,
    memoryUsage: 0,
    fps: 0,
    drawCalls: 0,
    instancedMeshes: 0,
    geometryCount: 0,
    triangleCount: 0,
    isLoading: true,
    error: null,
  });
  
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  
  // Measure network performance
  const measureNetwork = useCallback(async () => {
    const startTime = performance.now();
    let totalSize = 0;
    
    try {
      for (const url of filesUrls) {
        const response = await fetch(url);
        const blob = await response.blob();
        totalSize += blob.size;
      }
      
      const downloadTime = performance.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        payloadSize: totalSize,
        downloadTime,
      }));
      
    } catch (error) {
      console.error('Network measurement failed:', error);
      setMetrics(prev => ({ ...prev, error: (error as Error).message }));
    }
  }, [filesUrls]);
  
  // Measure parse performance
  const measureParse = useCallback((parseStart: number, parseEnd: number) => {
    const parseTime = parseEnd - parseStart;
    
    // Estimate main thread blocked time
    // (In real scenario, we'd use PerformanceObserver)
    const mainThreadBlocked = parseTime * 0.6; // Rough estimate
    const workerTime = parseTime * 0.4;
    
    setMetrics(prev => ({
      ...prev,
      parseTime,
      mainThreadBlocked,
      workerTime,
    }));
  }, []);
  
  // Measure FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    
    if (lastFrameTimeRef.current > 0) {
      const delta = now - lastFrameTimeRef.current;
      const fps = 1000 / delta;
      
      // Keep rolling average of last 60 frames
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }
      
      const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      
      setMetrics(prev => ({ ...prev, fps: Math.round(avgFps) }));
    }
    
    lastFrameTimeRef.current = now;
    frameCountRef.current++;
  }, []);
  
  // Measure memory (Chrome-specific)
  const measureMemory = useCallback(async () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMB = memory.usedJSHeapSize / (1024 * 1024);
      
      setMetrics(prev => ({ ...prev, memoryUsage: Math.round(memoryMB) }));
    } else {
      console.warn('performance.memory not available (Chrome only)');
    }
  }, []);
  
  // Measure draw calls (requires Three.js renderer info)
  const measureDrawCalls = useCallback((renderer: any) => {
    if (!renderer || !renderer.info) return;
    
    const { render } = renderer.info;
    
    setMetrics(prev => ({
      ...prev,
      drawCalls: render.calls || 0,
      triangleCount: render.triangles || 0,
    }));
  }, []);
  
  // Update geometry stats
  const updateGeometryStats = useCallback((stats: { 
    instancedMeshes: number; 
    geometryCount: number;
  }) => {
    setMetrics(prev => ({ ...prev, ...stats }));
  }, []);
  
  // Mark Time to First Render
  const markFirstRender = useCallback(() => {
    if (startTimeRef.current === 0) return;
    
    const ttfr = performance.now() - startTimeRef.current;
    
    setMetrics(prev => ({
      ...prev,
      timeToFirstRender: ttfr,
      isLoading: false,
    }));
  }, []);
  
  // Start benchmark
  const startBenchmark = useCallback(() => {
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    fpsHistoryRef.current = [];
    
    setMetrics(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Measure network
    measureNetwork();
    
  }, [measureNetwork]);
  
  // FPS measurement loop
  useEffect(() => {
    if (metrics.isLoading) return;
    
    let rafId: number;
    
    const loop = () => {
      measureFPS();
      rafId = requestAnimationFrame(loop);
    };
    
    rafId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(rafId);
  }, [metrics.isLoading, measureFPS]);
  
  // Memory measurement interval
  useEffect(() => {
    if (metrics.isLoading) return;
    
    const interval = setInterval(measureMemory, 1000);
    
    return () => clearInterval(interval);
  }, [metrics.isLoading, measureMemory]);
  
  // Notify on metrics update
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);
  
  return {
    metrics,
    startBenchmark,
    measureParse,
    measureDrawCalls,
    updateGeometryStats,
    markFirstRender,
  };
}

// Utility: Format metrics for display
export function formatMetrics(metrics: BenchmarkMetrics) {
  return {
    payload: `${(metrics.payloadSize / (1024 * 1024)).toFixed(2)} MB`,
    download: `${metrics.downloadTime.toFixed(0)} ms`,
    parse: `${metrics.parseTime.toFixed(0)} ms`,
    ttfr: `${metrics.timeToFirstRender.toFixed(0)} ms`,
    memory: `${metrics.memoryUsage} MB`,
    fps: `${metrics.fps} FPS`,
    drawCalls: `${metrics.drawCalls} calls`,
    triangles: `${(metrics.triangleCount / 1000).toFixed(1)}K tris`,
  };
}

// Utility: Compare two metrics
export function compareMetrics(a: BenchmarkMetrics, b: BenchmarkMetrics) {
  const payloadDiff = ((a.payloadSize - b.payloadSize) / b.payloadSize) * 100;
  const parseDiff = ((a.parseTime - b.parseTime) / b.parseTime) * 100;
  const fpsDiff = ((a.fps - b.fps) / b.fps) * 100;
  const memoryDiff = ((a.memoryUsage - b.memoryUsage) / b.memoryUsage) * 100;
  
  return {
    payload: { diff: payloadDiff, winner: payloadDiff < 0 ? 'a' : 'b' },
    parse: { diff: parseDiff, winner: parseDiff < 0 ? 'a' : 'b' },
    fps: { diff: fpsDiff, winner: fpsDiff > 0 ? 'a' : 'b' },
    memory: { diff: memoryDiff, winner: memoryDiff < 0 ? 'a' : 'b' },
  };
}
