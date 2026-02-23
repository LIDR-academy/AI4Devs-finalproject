# Performance Testing Protocol - Dashboard 3D

**Document:** Manual Performance Test Protocol  
**Ticket:** T-0509-TEST-FRONT  
**Feature:** US-005 Dashboard 3D Interactivo  
**Last Updated:** 2026-02-23  

---

## Overview

This document defines the manual performance testing protocol for the 3D Dashboard. These tests **cannot be automated** because they require real WebGL rendering, user interaction, and browser profiling tools.

**Automated Test:** Test 19 (render time <2s) runs automatically in Vitest.  
**Manual Tests:** Tests 20-21 (FPS, Memory) must be executed manually following this protocol.

---

## Prerequisites

### Environment Setup

**Required:**
- ✅ Dev environment running: `make front-dev` or `docker compose up frontend`
- ✅ Database seeded with 150 test parts (see Seed Script below)
- ✅ Chrome browser (latest version)
- ✅ Chrome DevTools open (F12 or Cmd+Option+I)

**Optional (for advanced analysis):**
- Chrome Lighthouse extension
- `fps-meter` npm package for overlay FPS display

### Seed Script

Create 150 test parts in the database:

```bash
# From project root
cd src/frontend
npm run seed:parts -- --count=150

# Or manually via SQL (Supabase dashboard):
# INSERT INTO blocks (id, iso_code, status, tipologia, low_poly_url, bbox)
# VALUES ...
```

**Seed Data Characteristics:**
- 150 parts total
- Mix of statuses: validated (50), in_fabrication (50), completed (50)
- Mix of tipologias: capitel (50), columna (50), dovela (50)
- All have `low_poly_url` pointing to valid GLB files
- Realistic bounding boxes for spatial distribution

---

## Test 20: FPS During Camera Interaction

### Objective

Verify the 3D dashboard maintains acceptable frame rate (>30 FPS, target 60 FPS) during continuous user interaction with 150 parts loaded.

### Success Criteria

- ✅ **Average FPS >30** (mandatory)
- ✅ **Average FPS >60** (ideal, matches POC baseline)
- ✅ **No long tasks >50ms** (no jank)
- ✅ **No dropped frames >10%**
- ✅ **Smooth camera transitions** (subjective feel)

### Steps

#### 1. Setup

1. Navigate to: `http://localhost:5173/dashboard`
2. Wait for all 150 parts to load (verify counter: "Mostrando 150 piezas")
3. Verify canvas is interactive (rotate camera slightly to confirm OrbitControls work)
4. Close all other browser tabs (isolate performance)
5. Open Chrome DevTools → **Performance** tab

#### 2. Recording

1. Click **Record** button (red circle)
2. Execute this exact 30-second sequence:
   - **0-10s:** No interaction (rest state - canvas should stay at 60 FPS)
   - **10-20s:** Rotate camera continuously with mouse drag
     - Hold left mouse button, drag in circles (clockwise, then counter-clockwise)
     - Smooth, continuous motion (no sudden stops)
   - **20-30s:** Zoom in/out with scroll wheel
     - 5 zoom-in actions (scroll up)
     - 5 zoom-out actions (scroll down)
     - Smooth transitions between zoom levels
3. Click **Stop** button

#### 3. Analysis

1. **FPS Graph:**
   - Locate the **Main** track in the timeline
   - Verify the **FPS** line (green) stays above 30 (ideally 60)
   - Acceptable dips: Brief drops to 40-50 FPS during zoom OK, but must recover quickly

2. **Long Tasks (Jank Detection):**
   - Look for **yellow/red bars** in the Main thread
   - Each bar >50ms is considered a "long task" (causes dropped frames)
   - Acceptable: max 3 long tasks during the entire 30s recording
   - If >5 long tasks: **FAIL** - investigate performance bottleneck

3. **Dropped Frames:**
   - DevTools shows dropped frame percentage in Summary panel
   - Acceptable: <10% dropped frames
   - If >10%: **FAIL** - LOD system may not be working correctly

4. **Subjective Feel:**
   - During recording, did the camera feel smooth?
   - Any visible stuttering or lag?
   - If it felt janky, FAIL even if FPS numbers look OK (frame time variance issue)

#### 4. Documentation

Take screenshots of:
1. **FPS graph** (Main track expanded, 30s timeline visible)
2. **Summary panel** (showing avg FPS, dropped frames %)
3. **Long tasks section** (should be mostly empty)

Save as:
```
docs/US-005/performance-results/test-20-fps-recording-YYYYMMDD.png
```

Record results in a markdown file:
```markdown
# Test 20 Results - FPS During Interaction

**Date:** 2026-02-23  
**Environment:** Chrome 120 / macOS 14.2 / MacBook Pro M1  
**Parts Count:** 150  

## Metrics

- **Average FPS:** 58.3 (✅ PASS - target >30, ideal >60)
- **Dropped Frames:** 2.1% (✅ PASS - target <10%)
- **Long Tasks:** 1 task of 63ms at 18.5s (✅ ACCEPTABLE)
  - Caused by: Zoom transition (brief GPU spike)
  - Recovered immediately (no sustained jank)

## Subjective Feel

- Camera rotation: Smooth, no stutter
- Zoom transitions: Slight hitch on first zoom (expected), then smooth
- Overall: ✅ PASS - Feels fluid and responsive

## Screenshots

- FPS Graph: test-20-fps-recording-20260223.png
- Summary: test-20-summary-20260223.png
```

---

## Test 21: Memory Usage After 2 Minutes

### Objective

Verify the 3D dashboard does not have memory leaks during extended use. Heap size should remain stable (<500 MB) after 2 minutes of continuous interaction.

### Success Criteria

- ✅ **Baseline snapshot: <200 MB** (initial load)
- ✅ **After 2 min snapshot: <500 MB** (after interaction)
- ✅ **Size delta: <100 MB** (growth during interaction)
- ✅ **Detached DOM nodes: <50** (no accumulation)

### Steps

#### 1. Setup

1. Navigate to: `http://localhost:5173/dashboard`
2. Wait for all 150 parts to load
3. Close all other browser tabs
4. Open Chrome DevTools → **Memory** tab

#### 2. Baseline Snapshot

1. Click **Take heap snapshot** button
2. Wait for snapshot to complete (~5-10 seconds)
3. Label snapshot as "Baseline"
4. Note the **Shallow Size** in summary (should be <200 MB)

#### 3. Interaction Sequence (2 minutes)

Execute these actions continuously for 2 minutes (set a timer):

**0:00-0:30 - Camera Rotation**
- Drag camera in circles (orbit controls)
- Rotate 360° clockwise, then counter-clockwise
- Vary rotation speed (slow, then fast)

**0:30-1:00 - Filter Testing**
- Click "capitel" filter checkbox (on)
- Wait 2 seconds
- Click "capitel" again (off)
- Click "validated" status filter (on)
- Click "validated" again (off)
- Click "limpiar filtros" button

**1:00-1:30 - Part Selection**
- Click on 5 different parts (opens modal each time)
- For each part:
  - Wait 2 seconds
  - Press ESC to close modal
  - Rotate camera slightly
  - Click next part

**1:30-2:00 - Zoom & Filters Combined**
- Zoom in (scroll wheel)
- Click "columna" filter
- Zoom out
- Clear filters
- Zoom in again
- Rotate camera

#### 4. After 2 Minutes Snapshot

1. Stop interacting (hands off mouse/keyboard)
2. Wait 5 seconds (let GC run)
3. Click **Take heap snapshot** again
4. Label snapshot as "After 2 min"
5. Note the **Shallow Size**

#### 5. Comparison & Analysis

1. Select "After 2 min" snapshot in dropdown
2. Change view mode to **Comparison**
3. Select "Baseline" as comparison baseline

**Analyze Delta:**
- **Size Delta:** Should be <100 MB
  - New objects allocated (camera matrices, filter state) = expected
  - If delta >100 MB: potential leak, investigate further
- **Detached DOM Nodes:** Expand "Detached DOM tree" in Object class filter
  - Should be <50 nodes
  - If >100 nodes: React components not unmounting correctly (FAIL)

**Common Leak Sources:**
- Event listeners not cleaned up (e.g., window.keydown for ESC key)
- Three.js geometries/materials not disposed (check LOD system)
- Zustand store holding stale references
- Modal components not unmounting fully

#### 6. Documentation

Take screenshots of:
1. **Baseline snapshot** summary (showing initial heap size)
2. **After 2 min snapshot** summary (showing final heap size)
3. **Comparison view** (showing delta breakdown)

Save as:
```
docs/US-005/performance-results/test-21-memory-baseline-YYYYMMDD.png
docs/US-005/performance-results/test-21-memory-after-YYYYMMDD.png
docs/US-005/performance-results/test-21-memory-comparison-YYYYMMDD.png
```

Record results in markdown:
```markdown
# Test 21 Results - Memory Usage

**Date:** 2026-02-23  
**Environment:** Chrome 120 / macOS 14.2 / MacBook Pro M1  
**Parts Count:** 150  

## Heap Snapshots

**Baseline (Initial Load):**
- Shallow Size: 187 MB (✅ PASS - target <200 MB)
- Total Objects: 3,245,678
- Detached DOM Nodes: 12

**After 2 Minutes (Post-Interaction):**
- Shallow Size: 241 MB (✅ PASS - target <500 MB)
- Total Objects: 3,421,003
- Detached DOM Nodes: 28

**Delta:**
- Size Growth: +54 MB (✅ PASS - target <100 MB)
- Growth Rate: +27 MB/min (acceptable for active interaction)

## Analysis

**Detached DOM Nodes:** 28 (+16 from baseline)
- Acceptable level (<50 threshold)
- Likely from: Modal mount/unmount cycles (5 parts selected)
- React reconciliation retains some nodes temporarily (GC will clean)

**Memory Allocation Breakdown (Top 3):**
1. Float32Array: +18 MB (Three.js geometry buffers - expected)
2. Object: +12 MB (Zustand store history - expected)
3. String: +8 MB (React fiber tree - expected)

**Conclusion:** ✅ PASS - No memory leak detected. Growth is within normal bounds for 2 min active use.

## Screenshots

- Baseline: test-21-memory-baseline-20260223.png
- After: test-21-memory-after-20260223.png
- Comparison: test-21-memory-comparison-20260223.png
```

---

## Troubleshooting

### Test 20 Issues

**Problem:** FPS <30 consistently  
**Solutions:**
1. Check LOD system is enabled (T-0507-FRONT)
2. Verify GPU acceleration: `chrome://gpu` (WebGL should be "Hardware accelerated")
3. Reduce part count to 50 and re-test (isolate issue)
4. Check for infinite render loops (React DevTools Profiler)

**Problem:** Long tasks during zoom  
**Solutions:**
1. Investigate `useGLTF.preload()` - geometry may be loading synchronously
2. Add debouncing to zoom handler
3. Check OrbitControls `dampingFactor` setting

### Test 21 Issues

**Problem:** Heap size >500 MB  
**Solutions:**
1. Check Three.js dispose calls in useEffect cleanup
2. Verify Zustand store doesn't accumulate history (devtools off in prod)
3. Run multiple 2-min cycles - if it keeps growing linearly: leak confirmed

**Problem:** >100 detached DOM nodes  
**Solutions:**
1. Add `key` props to all mapped React components
2. Check modal unmount cleanup (event listeners, timers)
3. Verify PartMesh doesn't hold refs after unmount

---

## Reference Data

### POC Baseline (2026-02-18)

**Configuration:**
- 1197 meshes (39,360 triangles total)
- No LOD system
- Simple grid layout

**Results:**
- FPS: 60 (constant)
- Memory: 41 MB heap
- File Size: 778 KB (uncompressed GLB)

**Conclusion:** Our target (150 parts with LOD) should EXCEED these numbers since:
- LOD reduces triangle count dynamically
- Draco compression reduces file size to 300-400 KB
- Expected FPS: 60+ (better than POC)
- Expected Memory: <100 MB (2.5x POC, but still excellent)

---

## Next Steps

After completing both tests:

1. **Document Results:** Update this file with actual metrics
2. **Update Backlog:** Mark T-0509-TEST-FRONT acceptance criteria as met/unmet
3. **Create Performance Report:** Aggregate both tests into single report for stakeholders
4. **Identify Optimizations:** If any test fails, create follow-up tickets (T-051X series)

---

**Approval:** This protocol must be executed before marking T-0509-TEST-FRONT as DONE.  
**Frequency:** Re-run tests on every major 3D feature change (LOD adjustments, new geometries, filter logic changes).

