/**
 * Dashboard3D Component
 * T-0504-FRONT: Main dashboard with 3D canvas and dockable sidebar
 * 
 * Orchestrates:
 * - Canvas3D for 3D visualization
 * - DraggableFiltersSidebar for filters UI
 * - EmptyState when no parts loaded
 * - LoadingOverlay during data fetch
 */

import React, { useState } from 'react';
import type { Dashboard3DProps, DockPosition } from './Dashboard3D.types';
import { CAMERA_CONFIG, STORAGE_KEYS, MESSAGES } from './Dashboard3D.constants';
import Canvas3D from './Canvas3D';
import DraggableFiltersSidebar from './DraggableFiltersSidebar';
import EmptyState from './EmptyState';
import LoadingOverlay from './LoadingOverlay';
import { usePartsStore } from '@/stores/partsStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Dashboard3D: React.FC<Dashboard3DProps> = ({
  initialCameraPosition = CAMERA_CONFIG.POSITION,
  showStats = false,
  emptyMessage,
  initialSidebarDock = 'right',
}) => {
  const { parts, isLoading, error } = usePartsStore();
  const [sidebarDock, setSidebarDock] = useLocalStorage<DockPosition>(
    STORAGE_KEYS.SIDEBAR_DOCK,
    initialSidebarDock
  );
  const [floatingPosition, setFloatingPosition] = useState({ x: 100, y: 100 });

  const handleDockChange = (newDock: DockPosition) => {
    setSidebarDock(newDock);
  };

  const handlePositionChange = (newPosition: { x: number; y: number }) => {
    setFloatingPosition(newPosition);
  };

  const isEmpty = parts.length === 0 && !isLoading;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Canvas Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: '100%',
        }}
      >
        <Canvas3D
          showStats={showStats}
          cameraConfig={{
            position: initialCameraPosition,
            fov: CAMERA_CONFIG.FOV,
            near: CAMERA_CONFIG.NEAR,
            far: CAMERA_CONFIG.FAR,
          }}
        />

        {/* Empty State Overlay */}
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <EmptyState message={emptyMessage || MESSAGES.EMPTY_STATE} />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay message={MESSAGES.LOADING} />}
      </div>

      {/* Sidebar with Filters */}
      <DraggableFiltersSidebar
        dockPosition={sidebarDock}
        onDockChange={handleDockChange}
        floatingPosition={floatingPosition}
        onPositionChange={handlePositionChange}
      >
        <h3 style={{ marginTop: 0, fontSize: '1.125rem' }}>{MESSAGES.FILTERS_TITLE}</h3>
        
        {/* Placeholder: Parts count */}
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Total: {parts.length} piezas
        </p>

        {/* TODO (T-0506): Real filters UI will be implemented here */}
        <div style={{ padding: '16px 0', color: '#999', fontSize: '0.75rem' }}>
          Filters UI (T-0506-FRONT)
        </div>
      </DraggableFiltersSidebar>
    </div>
  );
};

export default Dashboard3D;
