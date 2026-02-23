# US-005 - Dependency Order & Priority Map

**Created:** 2026-02-19  
**Source:** [09-mvp-backlog.md](../09-mvp-backlog.md) Line 242  
**Notion Database:** [Backlog - Entrega 2 (US-005)](https://www.notion.so/37e5065fd4f84ef59c7011b7533b7619)

---

## 📊 Critical Path (Dependency Order)

```
T-0500 (INFRA)
   ↓
T-0503 (DB)
   ├──→ T-0501 (BACK) ──→ T-0505 (FRONT) ──┬──→ T-0506 (FRONT)
   │                                        ├──→ T-0507 (FRONT)
   │                                        └──→ T-0508 (FRONT)
   └──→ T-0502 (AGENT)
   
T-0504 (FRONT) ──→ T-0505 (FRONT) [see above]
   ↓
[T-0505 Completes] ──→ T-0509 (TEST-FRONT)
                   ──→ T-0510 (TEST-BACK) [also needs T-0501, T-0502]
```

---

## 🎯 Priority Breakdown

### 🔵 PHASE 1: Foundation (P1-P2) - **BLOCKERS**
**Must complete first, blocks everything**

| Priority | Ticket | SP | Description | Blocks |
|----------|--------|----|-----------  |--------|
| **P1** 🔵 | [T-0500-INFRA](https://www.notion.so/30c14fa2c11781218538d219659ac22d) | 2 | Setup React Three Fiber Stack | T-0504 |
| **P2** 🔵 | [T-0503-DB](https://www.notion.so/30c14fa2c117811c8cbfde269e8315b0) | 1 | Add low_poly_url Column & Indexes | T-0501, T-0502 |

**Total:** 3 SP (~1 day)

---

### 🟡 PHASE 2: Backend Services (P3-P4)
**Can run in parallel after P2 completes**

| Priority | Ticket | SP | Description | Depends On | Blocks |
|----------|--------|----|-----------  |------------|--------|
| **P3** 🟡 | [T-0501-BACK](https://www.notion.so/30c14fa2c117811da534d652b596fd28) | 3 | List Parts API - No Pagination | T-0503 | T-0505 |
| **P4** 🟡 | [T-0502-AGENT](https://www.notion.so/30c14fa2c1178194be19c7298ce9a0ce) | 5 | Generate Low-Poly GLB from .3dm | T-0503 | - |

**Total:** 8 SP (~2 days, can parallelize)

---

### 🟢 PHASE 3: Frontend Core (P5-P6)
**Dashboard layout + 3D scene rendering**

| Priority | Ticket | SP | Description | Depends On | Blocks |
|----------|--------|----|-----------  |------------|--------|
| **P5** 🟢 | [T-0504-FRONT](https://www.notion.so/30c14fa2c117812daef1f5c638d6f151) | 3 | Dashboard 3D Canvas Layout | T-0500 | T-0505, T-0506, T-0507, T-0508 |
| **P6** 🟢 | [T-0505-FRONT](https://www.notion.so/30c14fa2c1178136bcebf223e67cbc2d) | 5 | 3D Parts Scene - Low-Poly Meshes | T-0504, T-0501 | T-0506, T-0507, T-0508 |

**Total:** 8 SP (~2 days)

---

### 🟢 PHASE 4: Frontend Features (P7-P9)
**Interactive filters, LOD optimization, selection**  
**Can run in parallel after P6 completes**

| Priority | Ticket | SP | Description | Depends On |
|----------|--------|----|-----------  |------------|
| **P7** 🟢 | [T-0506-FRONT](https://www.notion.so/30c14fa2c11781c4a9f3f96137a8698b) | 3 | Filters Sidebar & Zustand Store | T-0505 |
| **P8** 🟢 | [T-0507-FRONT](https://www.notion.so/30c14fa2c1178144aa8bc90fd495ed0a) | 5 | LOD System Implementation | T-0505 |
| **P9** 🟢 | [T-0508-FRONT](https://www.notion.so/30c14fa2c11781f48d19fdcd404e11b3) | 2 | Part Selection & Modal Integration | T-0505 |

**Total:** 10 SP (~2 days, can parallelize)

---

### ⚪️ PHASE 5: Quality Assurance (P10-P11)
**Integration tests (frontend + backend)**  
**Can run in parallel**

| Priority | Ticket | SP | Description | Depends On |
|----------|--------|----|-----------  |------------|
| **P10** ⚪️ | [T-0509-TEST-FRONT](https://www.notion.so/30c14fa2c11781aa9698fcfa979d4305) | 3 | 3D Dashboard Integration Tests | T-0505, T-0506, T-0507, T-0508 |
| **P11** ⚪️ | [T-0510-TEST-BACK](https://www.notion.so/30c14fa2c1178101840ec2e8f582de3b) | 3 | Canvas API Integration Tests | T-0501, T-0502 |

**Total:** 6 SP (~1-2 days, can parallelize)

---

## ⚡️ Parallelization Strategy

### Week 1 (Sprint 1)
**Day 1-2:**
```
Developer 1: T-0500-INFRA (2 SP) → T-0503-DB (1 SP) ✅ [Sequential]
Developer 2: Wait → T-0501-BACK (3 SP) [After T-0503]
Developer 3: Wait → T-0502-AGENT (5 SP) [After T-0503]
Developer 4: T-0504-FRONT (3 SP) [Parallel with T-0500, needs T-0500 complete]
```

**Day 3-4:**
```
Developer 1: T-0505-FRONT (5 SP) [After T-0504 + T-0501]
Developer 2: Support T-0505 or start T-0506 prep
Developer 3: Continue T-0502-AGENT (complex task)
Developer 4: Start T-0506-FRONT (3 SP) [After T-0505]
```

**Day 5:**
```
Developer 1: T-0507-FRONT (5 SP) [Parallel after T-0505]
Developer 2: T-0506-FRONT (3 SP) [Parallel after T-0505]
Developer 3: T-0502-AGENT completion
Developer 4: T-0508-FRONT (2 SP) [Parallel after T-0505]
```

### Week 2 (Sprint 2)
**Day 6-7:**
```
Developer 1: T-0509-TEST-FRONT (3 SP) [After T-0505-0508]
Developer 2: T-0510-TEST-BACK (3 SP) [After T-0501, T-0502]
Developer 3: Bug fixes from integration tests
Developer 4: Documentation & deployment prep
```

---

## 🚨 Critical Bottlenecks

### Bottleneck #1: T-0503-DB (P2)
**Impact:** Blocks both backend tickets (T-0501, T-0502)  
**Mitigation:** Prioritize DB migration on Day 1 immediately after T-0500  
**Duration:** <30s migration, but needs testing  

### Bottleneck #2: T-0505-FRONT (P6)
**Impact:** Blocks 3 frontend features (T-0506, T-0507, T-0508)  
**Mitigation:** Assign most experienced 3D developer  
**Duration:** 5 SP (1-2 days)  

### Bottleneck #3: T-0502-AGENT (P4)
**Impact:** Doesn't block frontend, but critical for full E2E testing  
**Mitigation:** Start early, can run in parallel with T-0501  
**Duration:** 5 SP (1-2 days, complex Celery task)  

---

## 📈 Sprint Metrics

| Phase | Story Points | Estimated Duration | Risk Level |
|-------|--------------|-------------------|------------|
| Phase 1: Foundation | 3 SP | 1 day | 🔴 High (Blockers) |
| Phase 2: Backend | 8 SP | 2 days | 🟡 Medium (Parallel) |
| Phase 3: Frontend Core | 8 SP | 2 days | 🟡 Medium |
| Phase 4: Frontend Features | 10 SP | 2 days | 🟢 Low (Parallel) |
| Phase 5: QA | 6 SP | 1-2 days | 🟢 Low (Parallel) |
| **Total** | **35 SP** | **8-10 days** | - |

---

## 📝 Notion Integration

Each ticket now includes:
- **🔵🟡🟢⚪️ Priority Icon:** Visual indicator of phase
- **🔗 Depends:** Explicit dependencies listed
- **⛔️ Blocks:** Downstream tickets that are blocked

**Example:**
```
🔵 P1 (Blocker) | Setup React Three Fiber Stack - Dependencies: @react-three/fiber@^8.15... 
| ⛔️ Blocks: T-0504
```

---

## 🎯 Recommended Start Sequence

1. **Start Today:** `T-0500-INFRA` (Developer 1, 2 SP, ~4 hours)
2. **Day 1 Afternoon:** `T-0503-DB` (Developer 1, 1 SP, ~2 hours)
3. **Day 2 Morning:** Parallel start:
   - `T-0501-BACK` (Developer 2, 3 SP)
   - `T-0502-AGENT` (Developer 3, 5 SP)
   - `T-0504-FRONT` (Developer 4, 3 SP)
4. **Day 3:** `T-0505-FRONT` (Developer 1, 5 SP) - **Critical path**
5. **Day 4-5:** Parallel:
   - `T-0506-FRONT` (Developer 2)
   - `T-0507-FRONT` (Developer 1)
   - `T-0508-FRONT` (Developer 4)
6. **Day 6-7:** Parallel testing:
   - `T-0509-TEST-FRONT` (Developer 1)
   - `T-0510-TEST-BACK` (Developer 2)

---

## 🔗 Quick Links

- **Notion Database:** [Backlog - Entrega 2 (US-005)](https://www.notion.so/37e5065fd4f84ef59c7011b7533b7619)
- **Git Branches:** `git branch | grep "US-005-T-"`
- **Technical Specs:** [`docs/US-005/`](.)
- **Master Backlog:** [`docs/09-mvp-backlog.md`](../09-mvp-backlog.md)

---

**Last Updated:** 2026-02-19  
**Status:** ✅ All 11 tickets synchronized with Notion + Git
