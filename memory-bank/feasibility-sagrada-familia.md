# Feasibility Analysis: Sagrada Familia Parts Management System

**Analysis Date**: 2026-01-13  
**Analyst Role**: Lead Software Architect & BIM Integration Expert  
**Scope**: TFM Project (1 developer, 3 months)  
**Context**: Enterprise/Industry 4.0 Solution for High-Profile Client

---

## Executive Summary

✅ **STRONGLY VIABLE & HIGH VALUE**. This project shifts from "General Product" to "Specific Solution", effectively simulating a real-world Digital Twin delivery.

**Why This Is a Winner**:
- ✅ **Real-World Relevance**: Solves a massive data management problem for complex architecture.
- ✅ **Clear Tech Stack**: Established tools (Rhino3dm, Three.js, SQL, LangChain) applied to a novel domain.
- ✅ **Scalable Scope**: Can start with 10 parts, scale to 10,000.
- ✅ **Agentic Value**: The "Intelligent Librarian" adds the AI layer that transforms it from a database to an intelligent system.

**Verdict**: ⭐⭐⭐⭐⭐ **TIER 1 CANDIDATE** (Comparable to Semantic Rhino in quality, but more "Enterprise" focused).

---

## 1. High-Performance Extraction Architecture

### The Challenge
Processing thousands of high-fidelity `.3dm` files is resource-intensive. Opening Rhino for every file is impossible (too slow/expensive).

### The Solution: Hybrid Extraction Pipeline

**A. Metadata Extraction (Fast Lane)**
- **Tool**: `rhino3dm` (Python library).
- **Process**: Reads file structure *without* starting Rhino.
- **Speed**: ~0.1s per file.
- **Data**: Layer names, Object User Text, Object Names, Material IDs.
- **Use Case**: Indexing, searching, checking attributes.

**B. Geometry Extraction (Heavy Lane)**
- **Tool**: **Rhino.Compute** (Headless Rhino Server).
- **Process**: Validates geometry, fixes bad objects, **generates render meshes** from NURBS.
- **Output**: `glTF` or `GLB` (optimized for web).
- **Strategy**: Worker Queue (Celery/Redis). Files are queued; extraction happens in background.

**Data Integrity Strategy**:
- **Hashing**: Generate a geometric hash (vertex check) to identify identical parts across different files.
- **UUID**: Use Rhino GUID as primary key, but enforce uniqueness check on ingestion.

---

## 2. Intelligent Agent Design (The "Reviewer")

### Role
The Agent acts as the **BIM Manager Assistant**. It doesn't just store data; it validates and enriches it.

### Architecture: LangGraph (Stateful Workflow)

**Workflow**:
1.  **Ingest**: Receive extracted metadata (JSON).
2.  **Validate**: "Is Layer Name compliant with BIM Standard ISO-19650?"
    *   *If No*: flag error, auto-suggest correction.
3.  **Classify**: "Based on name 'Col_Passion_01' and geometry bounding box, this is a 'Structural Column'."
4.  **Enrich**: Lookup material density in Knowledge Base, calculate weight.
5.  **Commit**: Write clean data to DB.

**Agent Context**:
- **Strict Mode**: Rules-based (Regex, Dictionary). "Name must start with [A-Z]".
- **Fuzzy Mode**: LLM-based. "This description 'Piedra arenisca' matches material 'Montjuic Stone'".

---

## 3. Data Model & Access Control

### Database Schema (PostgreSQL)

**Tables**:
*   `Parts`: Core data (UUID, Name, Status, ProductionBatchID).
*   `Geometry`: Link to glTF file (S3 path), BoundingBox, PolyCount.
*   `Metadata`: `JSONB` column. Allows storing arbitrary Rhino User Text keys without schema migration. 
*   `Events`: Audit log (Timestamp, User, EventType, OldVal, NewVal).

### RBAC (Role-Based Access Control)

**Roles**:
1.  **Admin (BIM Manager)**: Define schemas, approved entry.
2.  **Architect**: Upload geometry, edit design intent.
3.  **Industrial (Stonemason)**: View geometry, update status to "In Fabrication", "Shipped".
4.  **Viewer**: Read-only visualization.

**Concurrency Management**:
- **Optimistic Locking**: Every update checks `version_id`. If changed since read, reject write and prompt refresh. A must for 1000s of parts.

---

## 4. 3D Web Visualization (Three.js)

### The Bottleneck
Loading 5,000 unique meshes in a browser kills performance (RAM/Draw calls).

### Optimization Strategy

**1. Instancing (Critical)**
- Sagrada Família has repeated geometry.
- If "Column Type A" appears 50 times: Load geometry **ONCE**, render 50 instances (GPU Integers).
- Requires backend to identify "Geometric Clones".

**2. Format: glTF/GLB + Draco Compression**
- Convert Rhino Meshes to `.glb` with Draco compression (reduces file size 60%).
- Viewer: `Three.js` + `GLTFLoader`.

**3. Level of Detail (LOD)**
- **LOD 0**: Box (when camera is far).
- **LOD 1**: Low-Poly Mesh.
- **LOD 2**: High-Poly (only when selected/zoomed).

---

## 5. Automation & Traceability

### "The Watchdog"
- **Event-Driven Architecture**: Status change trigger.
- **Example**:
    - Industrial changes status to "Shipped".
    - System triggers `OnStatusChange`:
        - Updates "Expected Delivery Date".
        - Sends Email/Slack to Site Manager.
        - Agent checks if "Shipped" implies "Weight" must be verified.

### Traceability (Audit Log)
- **Immutable Log**: Every write to `Parts` table triggers an insert to `Events` table.
- **Visual Replay (Bonus)**: "Show me the state of the Nave as of Jan 2025".

---

## 6. Recommended Tech Stack (TFM MVP)

**Frontend**:
- **React** (UI framework).
- **Three.js / React-Three-Fiber** (3D Viewer).
- **Tailwind** (Styling).

**Backend**:
- **Python (FastAPI)**: Easy integration with AI/Rhino libs.
- **rhino3dm**: Metadata extraction.
- **LangChain/LangGraph**: Agent logic.

**Database**:
- **Supabase (PostgreSQL)**: Auth, Database, and Storage (S3) out of the box. Great for TFM speed.

**Infrastructure**:
- **Local Rhino.Compute**: For geometry processing (simulated for TFM, or run locally).

---

## 7. MVP Scope (3 Months)

**Month 1: The Pipeline**
- Setup Supabase & FastAPI.
- Script `rhino3dm` extraction of 50 sample files.
- Basic React Dashboard (List view).

**Month 2: The Agent & 3D**
- Implement LangGraph agent to classify parts upon upload.
- Three.js viewer loading `.glb` files.
- Link 3D selection to DB metadata.

**Month 3: Workflows & Optimization**
- "Industrial" role workflow (Update Status).
- Audit Log UI.
- Instancing optimization for larger assembly test.

---

## 8. Comparison with Previous Options

| Feature | Semantic Rhino (Top Pick) | **Sagrada Parts Manager (New)** |
| :--- | :--- | :--- |
| **Focus** | General AI Tool (SaaS) | Specific Enterprise Solution |
| **Tech Risk** | Medium (LLM accuracy) | Medium-High (3D Web Perf) |
| **Business Value**| Mass Market ($99/mo) | High Ticket (Custom Contract) |
| **Complexity** | Algorithmic | Systems/Architecture |
| **Novelty** | "AI does the work" | "System manages the reality" |

**Recommendation**:
If you want to work on **Systems Architecture, Databases, and Web 3D**, choose this.
If you want to work on **Core AI/ML Algorithms**, stick with Semantic Rhino.

**Both are excellent.** This option is more "Senior Engineer / Architect" portfolio material.
