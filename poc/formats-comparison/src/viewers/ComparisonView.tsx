/**
 * ComparisonView Component
 * 
 * Side-by-side comparison of glTF+Draco vs ThatOpen Fragments
 * with real-time metrics comparison.
 */

import React, { useState } from 'react';
import { GltfDracoViewer } from './GltfDracoViewer';
import { BenchmarkMetrics, compareMetrics } from '../hooks/useBenchmark';

interface ComparisonViewProps {
  gltfFiles: string[];
  fragmentsFiles: string[];
}

export function ComparisonView({ gltfFiles, fragmentsFiles }: ComparisonViewProps) {
  const [gltfMetrics, setGltfMetrics] = useState<BenchmarkMetrics | null>(null);
  const [fragmentsMetrics, setFragmentsMetrics] = useState<BenchmarkMetrics | null>(null);
  
  const comparison = gltfMetrics && fragmentsMetrics 
    ? compareMetrics(gltfMetrics, fragmentsMetrics)
    : null;
  
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        height: '60px',
        background: '#0f0f0f',
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
          ⚖️ POC: glTF+Draco vs ThatOpen Fragments
        </h1>
      </div>
      
      {/* Viewers Grid */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* glTF Viewer */}
        <div style={{ flex: 1, position: 'relative', borderRight: '2px solid #3B82F6' }}>
          <GltfDracoViewer 
            files={gltfFiles} 
            onMetricsUpdate={setGltfMetrics}
          />
        </div>
        
        {/* ThatOpen Viewer (placeholder for now) */}
        <div style={{ flex: 1, position: 'relative', background: '#1a1a1a' }}>
          {/* TODO: ThatOpenViewer component */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>ThatOpen Viewer</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>
              Requires IFC source files
              <br />
              (Rhino → IFC → Fragments workflow)
            </div>
            <div style={{ marginTop: '30px', fontSize: '12px', opacity: 0.5 }}>
              For POC, demonstrating glTF+Draco performance
              <br />
              ThatOpen evaluation requires IFC-based pipeline
            </div>
          </div>
          
          {/* Format Label */}
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: '#F59E0B',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            ThatOpen Fragments
          </div>
        </div>
      </div>
      
      {/* Comparison Stats Bar */}
      {comparison && (
        <div style={{
          height: '120px',
          background: '#0f0f0f',
          borderTop: '2px solid #3B82F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 40px',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: 'white',
        }}>
          <MetricComparison
            label="Payload"
            gltfValue={formatBytes(gltfMetrics!.payloadSize)}
            fragmentsValue="N/A"
            diff={comparison.payload.diff}
            winner={comparison.payload.winner}
          />
          
          <MetricComparison
            label="Parse Time"
            gltfValue={`${gltfMetrics!.parseTime.toFixed(0)} ms`}
            fragmentsValue="N/A"
            diff={comparison.parse.diff}
            winner={comparison.parse.winner}
          />
          
          <MetricComparison
            label="FPS"
            gltfValue={`${gltfMetrics!.fps} FPS`}
            fragmentsValue="N/A"
            diff={comparison.fps.diff}
            winner={comparison.fps.winner}
          />
          
          <MetricComparison
            label="Memory"
            gltfValue={`${gltfMetrics!.memoryUsage} MB`}
            fragmentsValue="N/A"
            diff={comparison.memory.diff}
            winner={comparison.memory.winner}
          />
        </div>
      )}
    </div>
  );
}

interface MetricComparisonProps {
  label: string;
  gltfValue: string;
  fragmentsValue: string;
  diff: number;
  winner: 'a' | 'b';
}

function MetricComparison({ label, gltfValue, fragmentsValue, diff, winner }: MetricComparisonProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{
          padding: '8px 12px',
          background: winner === 'a' ? '#10B981' : '#4B5563',
          borderRadius: '6px',
        }}>
          {gltfValue}
        </div>
        <div style={{ fontSize: '16px' }}>vs</div>
        <div style={{
          padding: '8px 12px',
          background: winner === 'b' ? '#10B981' : '#4B5563',
          borderRadius: '6px',
        }}>
          {fragmentsValue}
        </div>
      </div>
      {diff !== 0 && (
        <div style={{
          marginTop: '6px',
          fontSize: '11px',
          color: diff < 0 ? '#10B981' : '#EF4444',
        }}>
          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}
