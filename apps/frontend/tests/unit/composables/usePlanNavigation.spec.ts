import { describe, it, expect } from 'vitest'
import { usePlanNavigation } from '@/composables/usePlanNavigation'

describe('usePlanNavigation', () => {
    it('initializes with default values', () => {
        const { scale, position } = usePlanNavigation()
        expect(scale.value).toBe(1)
        expect(position.value).toEqual({ x: 0, y: 0 })
    })

    it('zooms in towards a point correctly', () => {
        const { scale, position, zoomToPoint } = usePlanNavigation()
        // Simulate dragging point (100, 100)
        // Zoom in (delta negative)
        // Initial state: scale 1, pos 0,0. Point 100,100 maps to 100,100 in world.
        zoomToPoint(-1, { x: 100, y: 100 }) 
        
        expect(scale.value).toBeGreaterThan(1)
        // If we zoom in at 100,100, the image should shift left/up to keep 100,100 under mouse.
        // Formula: newPos = P - (P - oldPos) * ratio
        // ratio > 1.
        // newPos = 100 - (100 - 0) * (1.1) = 100 - 110 = -10.
        expect(position.value.x).toBeLessThan(0)
        expect(position.value.y).toBeLessThan(0)
    })

    it('clamps zoom levels', () => {
        const { scale, zoomToPoint } = usePlanNavigation()
        // Zoom out aggressively
        for (let i = 0; i < 20; i++) zoomToPoint(10, { x: 0, y: 0 })
        expect(scale.value).toBeGreaterThanOrEqual(0.5) // MIN_SCALE

        // Zoom in aggressively
        for (let i = 0; i < 50; i++) zoomToPoint(-10, { x: 0, y: 0 })
        expect(scale.value).toBeLessThanOrEqual(10) // MAX_SCALE
    })
    
    it('drags correctly', () => {
        const { startDrag, onDrag, position } = usePlanNavigation()
        startDrag({ x: 0, y: 0 })
        onDrag({ x: 10, y: 20 })
        
        expect(position.value).toEqual({ x: 10, y: 20 })
        
        // Continue drag
        onDrag({ x: 15, y: 25 })
        expect(position.value).toEqual({ x: 15, y: 25 })
    })

    it('stops dragging', () => {
        const { startDrag, stopDrag, onDrag, position, isDragging } = usePlanNavigation()
        startDrag({ x: 0, y: 0 })
        expect(isDragging.value).toBe(true)
        
        stopDrag()
        expect(isDragging.value).toBe(false)
        
        // Should not move after stop
        onDrag({ x: 100, y: 100 })
        expect(position.value).toEqual({ x: 0, y: 0 })
    })

    it('resets correctly', () => {
        const { scale, position, zoomToPoint, reset } = usePlanNavigation()
        zoomToPoint(-1, { x: 0, y: 0 })
        reset()
        expect(scale.value).toBe(1)
        expect(position.value).toEqual({ x: 0, y: 0 })
    })
    
    it('fits to screen correctly', () => {
        const { scale, position, fitToScreen } = usePlanNavigation()
        // Container 1000x1000, Image 2000x2000
        // Expected scale: 0.5 * 0.9 = 0.45
        fitToScreen(1000, 1000, 2000, 2000)
        
        expect(scale.value).toBe(0.45)
        // Center: (1000 - 2000*0.45)/2 = (1000 - 900)/2 = 50
        expect(position.value.x).toBe(50)
        expect(position.value.y).toBe(50)
    })
})
