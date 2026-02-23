/**
 * DraggableFiltersSidebar Component
 * T-0504-FRONT: Dockable and draggable sidebar for filters
 * 
 * Features:
 * - Three dock positions: left, right, floating
 * - Draggable by handle
 * - Snap to edges behavior
 * - localStorage persistence
 * - Double-click to cycle positions
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { DraggableSidebarProps, DockPosition } from './Dashboard3D.types';
import { SIDEBAR_CONFIG, STORAGE_KEYS, ARIA_LABELS } from './Dashboard3D.constants';

const DraggableFiltersSidebar: React.FC<DraggableSidebarProps> = ({
  dockPosition: propDockPosition,
  onDockChange,
  floatingPosition = { x: 100, y: 100 },
  onPositionChange,
  children,
}) => {
  // Validate and sanitize dockPosition
  const validDockPositions: DockPosition[] = ['left', 'right', 'floating'];
  const dockPosition = validDockPositions.includes(propDockPosition) ? propDockPosition : 'right';

  // Clamp position to viewport bounds
  const clampPosition = useCallback((pos: { x: number; y: number }) => ({
    x: Math.max(0, pos.x),
    y: Math.max(0, pos.y),
  }), []);

  const [internalPosition, setInternalPosition] = useState(() => clampPosition(floatingPosition));
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });
  const hasLoadedFromStorage = useRef(false);
  
  // Ref to capture latest internalPosition for use in event handlers
  const internalPositionRef = useRef(internalPosition);
  internalPositionRef.current = internalPosition;

  // Load saved dock position on mount (only once)
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;
    hasLoadedFromStorage.current = true;

    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_DOCK);
    if (saved && (saved === 'left' || saved === 'right' || saved === 'floating')) {
      if (saved !== propDockPosition) {
        onDockChange(saved as DockPosition);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync internal position with floatingPosition prop
  useEffect(() => {
    if (floatingPosition && floatingPosition.x !== internalPosition.x || floatingPosition.y !== internalPosition.y) {
      setInternalPosition(clampPosition(floatingPosition));
    }
  }, [floatingPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = internalPosition;
  }, [internalPosition]);

  const handleDockChange = useCallback((newPosition: DockPosition) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_DOCK, newPosition);
    onDockChange(newPosition);
  }, [onDockChange]);

  // Drag useEffect - ONLY depends on isDragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      const newX = Math.max(0, elementStart.current.x + deltaX);
      const newY = Math.max(0, elementStart.current.y + deltaY);

      const newPosition = { x: newX, y: newY };
      setInternalPosition(newPosition);

      // Call onPositionChange if provided and in floating mode
      if (onPositionChange && dockPosition === 'floating') {
        onPositionChange(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      // Check for snap to edges using the latest position
      const snapThreshold = SIDEBAR_CONFIG.SNAP_THRESHOLD;
      const viewportWidth = window.innerWidth;
      const currentX = internalPositionRef.current.x;

      if (currentX < snapThreshold) {
        handleDockChange('left');
      } else if (currentX > viewportWidth - SIDEBAR_CONFIG.WIDTH - snapThreshold) {
        handleDockChange('right');
      } else if (onPositionChange) {
        onPositionChange(internalPositionRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDoubleClick = useCallback(() => {
    const cycleMap: Record<DockPosition, DockPosition> = {
      left: 'right',
      right: 'floating',
      floating: 'left',
    };
    handleDockChange(cycleMap[dockPosition]);
  }, [dockPosition, handleDockChange]);

  const getStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: dockPosition === 'floating' ? 'absolute' : 'fixed',
      width: `${SIDEBAR_CONFIG.WIDTH}px`,
      height: '100%',
      backgroundColor: '#f5f5f5',
      borderLeft: dockPosition === 'right' ? '1px solid #ddd' : 'none',
      borderRight: dockPosition === 'left' ? '1px solid #ddd' : 'none',
      boxShadow: dockPosition === 'floating' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
      transition: dockPosition !== 'floating' ? `all ${SIDEBAR_CONFIG.TRANSITION_DURATION}ms ease` : 'none',
      zIndex: 100,
    };

    if (dockPosition === 'left') {
      return { ...baseStyles, left: 0, top: 0 };
    } else if (dockPosition === 'right') {
      return { ...baseStyles, right: 0, top: 0 };
    } else {
      return {
        ...baseStyles,
        left: `${internalPosition.x}px`,
        top: `${internalPosition.y}px`,
      };
    }
  };

  const getClassName = (): string => {
    const classes = ['draggable-filters-sidebar'];
    if (dockPosition === 'left') classes.push('docked-left');
    if (dockPosition === 'right') classes.push('docked-right');
    if (dockPosition === 'floating') classes.push('floating');
    return classes.join(' ');
  };

  return (
    <aside
      role="complementary"
      className={getClassName()}
      style={getStyles()}
    >
      {/* Drag Handle */}
      <div
        role="button"
        tabIndex={0}
        aria-label={ARIA_LABELS.DRAG_HANDLE}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          height: `${SIDEBAR_CONFIG.DRAG_HANDLE_HEIGHT}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#e0e0e0',
          cursor: isDragging ? 'grabbing' : 'grab',
          borderBottom: '1px solid #ccc',
        }}
      >
        {/* 6-dot Grip Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="7" cy="6" r="1.5" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="17" cy="6" r="1.5" />
          <circle cx="7" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="17" cy="12" r="1.5" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      </div>

      {/* Dock Position Controls */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fafafa',
        }}
      >
        <button
          aria-label={ARIA_LABELS.DOCK_LEFT}
          onClick={() => handleDockChange('left')}
          style={{
            flex: 1,
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: dockPosition === 'left' ? '#007bff' : '#fff',
            color: dockPosition === 'left' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '3px',
          }}
        >
          ← Left
        </button>
        <button
          aria-label={ARIA_LABELS.DOCK_RIGHT}
          onClick={() => handleDockChange('right')}
          style={{
            flex: 1,
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: dockPosition === 'right' ? '#007bff' : '#fff',
            color: dockPosition === 'right' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '3px',
          }}
        >
          Right →
        </button>
        <button
          aria-label={ARIA_LABELS.FLOAT}
          onClick={() => handleDockChange('floating')}
          style={{
            flex: 1,
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: dockPosition === 'floating' ? '#007bff' : '#fff',
            color: dockPosition === 'floating' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '3px',
          }}
        >
          ⚡ Float
        </button>
      </div>

      {/* Sidebar Content */}
      <div style={{ padding: '16px', overflowY: 'auto', height: 'calc(100% - 100px)' }}>
        {children}
      </div>
    </aside>
  );
};

export default DraggableFiltersSidebar;
