import { ref, computed } from 'vue'

interface Position {
  x: number
  y: number
}

export function usePlanNavigation() {
  const scale = ref(1)
  const position = ref<Position>({ x: 0, y: 0 })
  const isDragging = ref(false)
  const dragConstraints = ref<{ imgW: number; imgH: number; containerW: number; containerH: number } | null>(null)
  
  // Internal state for dragging
  const lastPointerPosition = ref<Position | null>(null)

  // Configuration
  const minScale = ref(0.5)
  const MAX_SCALE = 10
  const ZOOM_SENSITIVITY = 0.1

  const transformStyle = computed(() => ({
    transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
    cursor: isDragging.value ? 'grabbing' : 'grab',
    transformOrigin: '0 0', // Crucial: Matrix transformations are applied from top-left, we handle the offset manually
    willChange: 'transform' // Performance hint
  }))

  const setScale = (newScale: number) => {
    scale.value = Math.min(Math.max(newScale, minScale.value), MAX_SCALE)
  }

  /**
   * Zooms towards a specific point (usually the mouse cursor).
   * @param delta - Direction of zoom (positive = zoom out, negative = zoom in)
   * @param point - The point to zoom towards (relative to the container)
   */
  const zoomToPoint = (delta: number, point: Position) => {
    // Calculate new scale
    // If delta is negative (scroll up), we zoom in (factor > 1). 
    // If delta is positive (scroll down), we zoom out (factor < 1).
    const factor = 1 - (delta * ZOOM_SENSITIVITY)
    const distinctNewScale = scale.value * factor
    
    // Clamp the scale
    const newScale = Math.min(Math.max(distinctNewScale, minScale.value), MAX_SCALE)
    
    // Calculate the actual ratio applied (because of clamping)
    const scaleRatio = newScale / scale.value

    // Calculate new position to keep the point fixed relative to the viewport
    // NewPos = Point - (Point - OldPos) * Ratio
    position.value.x = point.x - (point.x - position.value.x) * scaleRatio
    position.value.y = point.y - (point.y - position.value.y) * scaleRatio
    
    scale.value = newScale
  }

  const zoomIn = () => {
     // Zoom to center if no point provided (or just logical center of current view)
     // For simplicity in buttons, we can zoom to the center of the current viewport or 0,0
     // But usually we want to zoom to the center of the screen/container.
     // Since we don't have container dims here easily without refs, let's just zoom in place or at 0,0 relative?
     // Actually, if we zoom without a point, it zooms from 0,0 (top-left).
     // A better UX for buttons is zooming to the center of the current view.
     // Let's assume the component will pass the center point, or we handle "center" logic in the component.
     // For now, let's expose a simple zoom that takes a point, or defaults to top-left if careful.
     
     // To keep this pure JS/TS without DOM dependency, we might need the component to pass the center.
     // But for now let's just update scale and let the origin be 0,0 (which shifts image). 
     // Ideally, the component calling this via buttons supplies the center of the container.
     
     // Let's just create a helper that strictly changes scale, useful for initial checks.
     // But real usage should prefer zoomToPoint.
     setScale(scale.value * (1 + ZOOM_SENSITIVITY))
  }

  const zoomOut = () => {
    setScale(scale.value * (1 - ZOOM_SENSITIVITY))
  }

  const startDrag = (point: Position) => {
    isDragging.value = true
    lastPointerPosition.value = point
  }

  const onDrag = (point: Position) => {
    if (!isDragging.value || !lastPointerPosition.value) return

    const dx = point.x - lastPointerPosition.value.x
    const dy = point.y - lastPointerPosition.value.y

    position.value.x += dx
    position.value.y += dy
    
    lastPointerPosition.value = point
  }

  const stopDrag = () => {
    isDragging.value = false
    lastPointerPosition.value = null
  }
  
  const reset = () => {
    scale.value = 1
    position.value = { x: 0, y: 0 }
  }

  // Helper to fit image to screen initially
  const fitToScreen = (containerWidth: number, containerHeight: number, imageWidth: number, imageHeight: number) => {
    const scaleX = containerWidth / imageWidth
    const scaleY = containerHeight / imageHeight
    const newScale = Math.min(scaleX, scaleY) * 0.9 // 90% fit
    
    scale.value = newScale
    
    // Center it
    position.value.x = (containerWidth - imageWidth * newScale) / 2
    position.value.y = (containerHeight - imageHeight * newScale) / 2
  }

  return {
    scale,
    position,
    isDragging,
    minScale,
    transformStyle,
    zoomToPoint,
    startDrag,
    onDrag,
    stopDrag,
    reset,
    fitToScreen
  }
}
