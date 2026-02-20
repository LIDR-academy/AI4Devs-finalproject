/**
 * useDraggable Hook
 * T-0504-FRONT: Custom hook for drag behavior with bounds clamping
 * 
 * Handles mouse drag interactions with snap-to-edge behavior
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position2D, DragBounds } from '../components/Dashboard/Dashboard3D.types';

interface UseDraggableOptions {
  initialPosition?: Position2D;
  bounds?: DragBounds;
  snapThreshold?: number;
  onDragEnd?: (position: Position2D) => void;
  onSnap?: (edge: 'left' | 'right' | null) => void;
}

interface UseDraggableReturn {
  position: Position2D;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useDraggable({
  initialPosition = { x: 0, y: 0 },
  bounds,
  snapThreshold = 50,
  onDragEnd,
  onSnap,
}: UseDraggableOptions = {}): UseDraggableReturn {
  const [position, setPosition] = useState<Position2D>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position2D>({ x: 0, y: 0 });
  const elementStart = useRef<Position2D>({ x: 0, y: 0 });

  const clampPosition = useCallback(
    (pos: Position2D): Position2D => {
      if (!bounds) return pos;

      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y)),
      };
    },
    [bounds]
  );

  const checkSnap = useCallback(
    (pos: Position2D): 'left' | 'right' | null => {
      const viewportWidth = window.innerWidth;

      if (pos.x < snapThreshold) {
        return 'left';
      }
      if (pos.x > viewportWidth - snapThreshold) {
        return 'right';
      }
      return null;
    },
    [snapThreshold]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = position;
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      const newPosition = clampPosition({
        x: elementStart.current.x + deltaX,
        y: elementStart.current.y + deltaY,
      });

      setPosition(newPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);

      const finalPosition = position;
      const snapEdge = checkSnap(finalPosition);

      if (snapEdge && onSnap) {
        onSnap(snapEdge);
      }

      if (onDragEnd) {
        onDragEnd(finalPosition);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, clampPosition, checkSnap, onDragEnd, onSnap]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
}
