# Feasibility Analysis: AEC Interaction Copilot (NL to Script)

**Analysis Date**: 2025-12-26  
**Analyst Role**: Lead Software Architect (LLM Integrations + Security)  
**Scope**: TFM Project (1 developer, 3 months)

---

## Executive Summary

⚠️ **CRITICAL FINDING**: **AEC Copilot is HIGH RISK for production use** due to code execution safety concerns. While technically feasible as a demo/research project, deploying this to real users requires **enterprise-grade sandboxing** that exceeds TFM scope.

**Verdict**: ❓ **VIABLE as Research Demo** | ❌ **NOT VIABLE as Production Tool** (3 months)

**The Brutal Truth**: **"This is aDemo That Will WOW at a University Presentation but Terrify a Law Firm's IT Department."**

---

## 1. The Destructive Hallucination Problem

### Scenario: The $50,000 Mistake

**User Intent**: "Delete the temporary construction lines"

**LLM Hallucinates**:
```python
import rhinoscriptsyntax as rs
# Delete all objects (OOPS - misunderstood "all")
rs.DeleteObjects(rs.AllObjects())
```

**Result**:
- Entire project file cleared
- 40 hours of work lost
- If auto-save triggered: **unrecoverable**

**Research Validation**:
- LLMs generate code with **security vulnerabilities** (buffer overflows, access control issues)[Research]
- **Prompt injection** can manipulate LLM to generate malicious code[Research]
- **Sandbox escapes** occur even in containerized environments[Research]

---

### Safety Risk Assessment

| Risk | Probability | Impact | Industry Precedent |
|------|-------------|--------|-------------------|
| **Destructive deletion** | High | Catastrophic | GitHub Copilot warns users NOT to blindly trust code |
| **File system access** (`os.remove()`) | Medium | Critical | VS Code restricts extension file permissions |
| **Infinite loops** (resource exhaustion) | Medium | High | Jupyter kernels have timeout limits |
| **Data exfiltration** (send model to API) | Low | Critical | Enterprise CAD blocks network calls |

**The Legal Problem**: If your plugin deletes a user's work, **you're liable**. Professional indemnity insurance won't cover "I let an AI run arbitrary code."

---

## 2. Guardrail Architecture: What's Actually Possible

### Option A: Sandboxing (The Industry Standard)

**How It Works**:
```
User prompt → LLM generates code
  ↓
Code runs in isolated Python environment (Docker container)
  ↓
Whitelisted RhinoScript APIs only (no os, sys, subprocess)
  ↓
Resource limits (1GB RAM, 10 sec timeout)
```

**Technologies**:
- **Docker**: Full OS-level isolation
- **gVisor**: User-mode kernel (Google's sandbox)
- **RestrictedPython**: Python exec() with AST filtering

**Complexity Assessment**:

| Component | Dev Time | Expertise Required |
|-----------|----------|-------------------|
| Docker setup | 1 week | DevOps (moderate) |
| Rhino API whitelisting | 2 weeks | RhinoCommon expert (high) |
| Resource limits | 1 week | Linux cgroups (moderate) |
| **TOTAL** | **4 weeks** | **High** |

**Problem**: This is 33% of your TFM timeline JUST for security infrastructure.

---

### Option B: Dry-Run Preview (Pragmatic for TFM)

**How It Works**:
```
1. LLM generates Python script
2. Mark all operations as "preview mode"
3. Execute → Create TEMPORARY geometry (different layer)
4. User reviews visual result in Rhino
5. User approves → Run again for REAL
   User rejects → Discard, try new prompt
```

**Example**:
```python
# Generated script (preview mode)
preview_layer = rs.AddLayer("AI_PREVIEW_TEMP")
rs.CurrentLayer(preview_layer)

# User's request: "Create a grid of columns"
for x in range(0, 50, 5):
    for y in range(0, 50, 5):
        col = rs.AddCylinder(...)
        rs.ObjectLayer(col, preview_layer)  # All on temp layer

# User sees result → approves → script re-runs on real layer
```

**Advantages**:
- ✅ **No sandbox complexity** (uses Rhino's built-in undo stack)
- ✅ **Visual verification** (user SEES what will happen)
- ✅ **Rhino-native** (leverages layers, not external containers)

**Limitations**:
- ⚠️ **Doesn't prevent file I/O exploits** (malicious `open('/etc/passwd')`)
- ⚠️ **Doesn't stop resource exhaustion** (infinite loop still crashes Rhino)

**TFM Viability**: ⭐⭐⭐⭐ **BEST COMPROMISE** for student project

---

### Option C: Whitelist-Only Operations (Safest but Limited)

**Concept**: Only allow pre-approved operations

**Allowed Commands**:
- `rs.AddBox()`, `rs.AddCylinder()`, `rs.AddSphere()`
- `rs.SelectObjects()`, `rs.MoveObjects()`
- `rs.AddLayer()`, `rs.ObjectLayer()`

**Forbidden Commands**:
- `rs.DeleteObjects()` (too dangerous)
- `os.*`, `sys.*`, `subprocess.*` (file system access)
- `eval()`, `exec()` (code injection)

**Implementation**:
```python
WHITELIST = [
    'rs.AddBox', 'rs.AddCylinder', 'rs.SelectObjects',
    # ... 50 more safe functions
]

def execute_safe_code(llm_code):
    ast_tree = ast.parse(llm_code)
    for node in ast.walk(ast_tree):
        if isinstance(node, ast.Call):
            func_name = ast.unparse(node.func)
            if func_name not in WHITELIST:
                raise SecurityError(f"Forbidden: {func_name}")
    # Only execute if all calls are whitelisted
    exec(llm_code)
```

**Trade-off**: **Safety vs. Power**. This kills the "do anything" promise.

---

## 3. The Context Awareness Challenge

### The Blindness Problem

**User**: "Move *that* column to the left"

**LLM**: "What column? I can't see your screen."

**The Issue**: GPT-4 is text-only. No vision of Rhino's viewport.

---

### Solution 1: Scene Serialization (Token Explosion)

**Inject Rhino state into prompt**:
```
Current scene:
- GUID: 3f8a12bd-... | Type: Cylinder | Layer: Structure | Center: (10, 5, 0) | Height: 3.5m
- GUID: 7c2e94af-... | Type: Box | Layer: Walls | Corner: (0,0,0) | Size: 5x5x3
- GUID: 9b1d56ce-... | Type: Sphere | Layer: Temp | Center: (2,2,1) | Radius: 0.5m
... (5,000 more objects)
```

**Token Cost Analysis**:

| Scenario | Objects | Token Count | GPT-4 Cost (per query) |
|----------|---------|-------------|------------------------|
| Small project | 100 | ~2,000 | $0.02 |
| Medium project | 1,000 | ~20,000 | $0.20 |
| Large project | 10,000 | ~200,000 | **$2.00** |

**Problem**: GPT-4 context window = 128k tokens. Large AEC files have **100k+ objects**. **Exceeds window**.

**Research Finding**: Users report GPT-4 requires "10-20 go-arounds" for intermediate Rhino scripts[Research]. Adding full scene context makes this WORSE.

---

### Solution 2: Selection-Only Context (Practical)

**Smarter Approach**: Only serialize SELECTED objects

```python
selected = rs.SelectedObjects()
context = ""
for obj in selected:
    context += f"- {rs.ObjectName(obj)}: {rs.ObjectType(obj)} at {rs.ObjectCenter(obj)}\n"

prompt = f"""
You are a Rhino scripting assistant.
User has selected these objects:
{context}

User request: "{user_input}"

Generate Python script using rhinoscriptsyntax.
"""
```

**Token Savings**: 100 selected objects = 2k tokens (affordable)

**Advantage**: Users already use selection to indicate "these objects" in Rhino workflow.

---

### Solution 3: Multimodal LLM (Future-Proof)

**GPT-4 Vision** (Dec 2023): Can "see" screenshots

**Hypothetical Workflow**:
1. Capture Rhino viewport screenshot
2. Send to GPT-4V: "What objects are visible?"
3. GPT-4V: "I see 3 red cylinders, 2 blue boxes"
4. User: "Delete the red ones"
5. GPT-4V generates script

**Current Status**: ❌ **Not production-ready** for CAD
- GPT-4V struggles with **precision** (can't read coordinates from pixels)
- **Hallucination rate higher** than text-only GPT-4

**TFM Viability**: ⭐ **Research novelty** but immature for reliability

---

## 4. Code Gen vs. Graph Gen Showdown

### Option A: Python Script Generation (Feasible)

**What LLM Generates**:
```python
import rhinoscriptsyntax as rs

# User: "Create a parametric facade with 10x10 panels"
for i in range(10):
    for j in range(10):
        center = (i * 1.5, j * 1.5, 0)
        panel = rs.AddBox([(0,0,0), (1,1,0.1)])
        rs.MoveObject(panel, center)
```

**Research Validation**:
- **RhinoGPT plugin** exists (fine-tuned GPT-4 for RhinoScript)[Research]
- GPT-4 knows `rhinoscriptsyntax` (though data cutoff is 2021)[Research]
- **Requires iteration**: Users report "several go-arounds" for complex scripts

**Advantages**:
- ✅ **LLMs are GOOD at code generation** (trained on GitHub)
- ✅ **Output is readable** (users can review Python)
- ✅ **Debugging possible** (syntax errors, logical fixes)

**TFM Viability**: ⭐⭐⭐⭐⭐ **HIGHLY FEASIBLE**

---

### Option B: Grasshopper XML Generation (Nightmare)

**What This Would Require**:
1. LLM generates **Grasshopper component graph** (abstract representation)
2. Serialize graph to GH XML format (`.ghx` file)
3. Load into Grasshopper

**Example Grasshopper XML (simplified)**:
```xml
<GHDocument version="3.0">
  <Component Name="Point" GUID="abc123" X="50" Y="100">
    <Output Name="Point" Type="Point3d" Value="{0,0,0}"/>
  </Component>
  <Component Name="Circle" GUID="def456" X="150" Y="100">
    <Input Name="Plane" SourceGUID="abc123"/>
    <Input Name="Radius" Value="5.0"/>
  </Component>
 <Wire From="abc123.Point" To="def456.Plane"/>
</GHDocument>
```

**Complexity Assessment**:

| Challenge | Difficulty | Reason |
|-----------|------------|--------|
| **Component identification** | Very High | 1,000+ GH components, each with specific input/output schema |
| **Wiring logic** | Critical | Must match GUID references perfectly (one error = broken file) |
| **Binary format** | Extreme | `.gh` files are binary, not XML (requires GH_IO.dll serialization) |
| **LLM training data** | Poor | Grasshopper XML/binary not common in LLM training sets |

**Research Finding**: GH SDK `GH_IO.dll` allows XML serialization, BUT you'd need to:**teach the LLM the entire Grasshopper component library**[Research]. This is **PhD-level thesis work**, not a TFM.

---

### The Verdict: Python ONLY

**Recommendation**: Abandon Grasshopper generation. Focus on **Python scripts** (rhinoscriptsyntax).

**Why**:
- Python code generation: **80% of the value** for **20% of the complexity**
- Grasshopper XML: **20% additional value** (power users already know GH) for **400% complexity**

**TFM Scope Reality**: You have 12 weeks. Don't waste 8 of them reverse-engineering Grasshopper's binary format.

---

## 5. Speed vs. GUI: The Usability Truth

### Where Natural Language WINS

| Use Case | GUI Time | NL Time | Winner |
|----------|----------|---------|--------|
| **Complex selection** | 5 min (manual clicking) | 30 sec (type query) | ✅ **NL** |
| **Batch operations** | 10 min (repeat 50x) | 1 min (generate loop) | ✅ **NL** |
| **"Find all beams > 6m"** | 3 min (filter by length) | 20 sec ("select beams longer than 6m") | ✅ **NL** |
| **Parametric patterns** | 15 min (Grasshopper setup) | 2 min (describe pattern) | ✅ **NL** |

**Research Validation**: NL CAD interfaces show **30-40% faster prototyping** for early-stage design[Research].

---

### Where GUI WINS

| Use Case | GUI Time | NL Time | Winner |
|----------|----------|---------|--------|
| **Simple box creation** | 1 sec (click icon) | 5 sec (type + wait for LLM) | ✅ **GUI** |
| **Precise placement** | 2 sec (snap to point) | 15 sec (describe coordinates) | ✅ **GUI** |
| **Visual adjustment** | 3 sec (drag handle) | 30 sec (regenerate script) | ✅ **GUI** |
| **Undo mistake** | 1 sec (Ctrl+Z) | 10 sec (new prompt) | ✅ **GUI** |

**Insight**: NL is **SLOWER for direct manipulation** tasks. It's a **query interface**, not a replacement for mouse+keyboard.

---

### The Sweet Spot: Hybrid Workflow

**Recommended UX**:
```
Rhino GUI (for direct edits)
  +
Chat Panel (for complex queries/automation)
```

**Example Workflow**:
1. User models walls manually (GUI)
2. User wants to add 50 evenly-spaced columns
3. Types in chat: "Create columns every 3m along this curve"
4. Preview appears → User approves
5. Continues manual editing (GUI)

**This is how GitHub Copilot works**: **Augments** coding, doesn't replace it.

---

## 6. MVP Definition: Scoped for TFM Success

### ❌ What You CANNOT Build (Too Risky)

1. **Production-Ready Sandbox**: Requires Docker + security audit (4+ weeks)
2. **Grasshopper XML Generation**: PhD-level complexity
3. **Multimodal Vision**: GPT-4V not precise enough for CAD
4. **General-Purpose Scripting**: Unlimited API access = security nightmare

---

### ✅ What You CAN Build (3-Month MVP)

**Product Name**: "Rhino Copilot: Selection & Automation Assistant"

**Scope**:
- **Input**: Natural language queries (text-based chat panel)
- **Output**: Python scripts (rhinoscriptsyntax only)
- **Safety**: Dry-run preview mode (temp layer)
- **Context**: Selection-based (ignores unselected objects)

**Allowed Operations** (Whitelist):
- **Selection**: "Select all objects on layer X", "Find surfaces > 100 m²"
- **Creation**: "Create grid of boxes", "Array circles along curve"
- **Transformation**: "Move selected objects 5m up", "Rotate 45°"
- **Organization**: "Put all curves on layer 'Temp'", "Group by height"

**Forbidden Operations**:
- `rs.DeleteObjects()` → Too dangerous (user must delete manually)
- File I/O (`open()`, `os.remove()`) → Security risk
- Network calls (`requests.get()`) → Data exfiltration

---

### Technical Architecture

**Components**:
```
1. Rhino Plugin (C# + Eto UI)
   ↓
2. Chat Panel (text input)
   ↓
3. Python Backend (Flask API)
   ↓
4. LLM API (GPT-4)
   ↓
5. Code Validator (AST whitelist checker)
   ↓
6. Dry-Run Executor (temp layer preview)
   ↓
7. User Approval Dialog → Execute for real
```

**Tech Stack**:
- **Frontend**: C# Rhino plugin (Eto.Forms)
- **Backend API**: Python Flask (local server)
- **LLM**: OpenAI GPT-4 API
- **Safety**: RestrictedPython or custom AST parser
- **Preview**: Rhino layers + ObjectUserText tags

---

### 12-Week Timeline

**Weeks 1-2: Prototype unsafe LLM integration**
- [ ] GPT-4 generates basic rhinoscriptsyntax
- [ ] Test on 20 example prompts
- [ ] **Milestone**: 70%+ accuracy on simple tasks

**Weeks 3-4: Build whitelist validator**
- [ ] Implement AST parser for Python
- [ ] Define safe API whitelist (50 functions)
- [ ] Reject forbidden calls (`delete`, `os.*`)
- [ ] **Milestone**: Block all dangerous operations

**Weeks 5-6: Context injection**
- [ ] Extract selected object metadata (GUIDs, types, layers)
- [ ] Inject into LLM prompt
- [ ] **Milestone**: LLM responds to "selected objects" correctly

**Weeks 7-8: Dry-run preview mode**
- [ ] Create temp layer for preview geometry
- [ ] Color-code preview (green = preview, blue = real)
- [ ] Build approval dialog
- [ ] **Milestone**: User see results before commit

**Weeks 9-10: Rhino plugin UI**
- [ ] Build chat panel (Eto.Forms)
- [ ] Integrate with Flask backend
- [ ] Add loading indicators
- [ ] **Milestone**: End-to-end workflow in Rhino

**Weeks 11-12: Testing & TFM write-up**
- [ ] User testing with 5+ architects
- [ ] Document failure cases
- [ ] Write thesis (safety architecture focus)
- [ ] **Milestone**: Thesis submitted

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Destructive hallucination** | High | Catastrophic | **Mandatory dry-run preview** + NO delete operations |
| **LLM API downtime** | Low | High | Cache previous responses, local fallback prompts |
| **Token costs** | Medium | Medium | Limit context to 2k tokens (selected objects only) |
| **Whitelist bypass** | Low | High | Use AST parsing (harder to evade than regex) |
| **User rejects previews** | High | Medium | **Document expected accuracy**: 70-80%, not 100% |

---

## 8. The Four-Way TFM Comparison

| Criteria | Smart XREF | Semantic Rhino | SmartFabricator | **AEC Copilot** |
|----------|------------|----------------|-----------------|----------------|
| **Tech Risk** | Low | Medium | Medium-High | **VERY HIGH** |
| **Safety Concerns** | None | None | High (G-code) | **CRITICAL (code exec)** |
| **Market Demand** | High (7k) | Very High | High (3.4k) | **Unknown (novelty)** |
| **Commercial Moat** | Low (SQL) | High (AI+domain) | Medium (ML) | **Medium (UX)** |
| **TFM Novelty** | Medium | High | High | **VERY HIGH** |
| **Production-Ready** | ✅ Yes | ✅ Yes | ⚠️ Conditional | **❌ NO (demo only)** |
| **Revenue Potential** | $50-100/yr | $99/mo | $50-100 | **$0 (liability risk)** |
| **Implementation Time** | 12 weeks | 12 weeks | 12 weeks (MVP) | **12 weeks (demo)** |
| **Recommendation** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (MVP) | **⭐⭐⭐ (research)** |

---

## 9. The Brutal Truth

### The Academic Perspective
> "This is cutting-edge AI research! Natural language CAD interfaces are the future!"

**Reality**: Yes, but the **future is 5-10 years away**. NL CAD works for:
- Startups with legal teams
- Research prototypes (non-production)
- Enterprise CAD with sandboxed cloud execution

**NOT for**: Solo developer shipping to 1,000 architects in 3 months.

---

### The Production Perspective

**GitHub Copilot** (the gold standard) has:
- Army of security engineers
- Extensive user disclaimers
- "Code suggestions may be wrong" warnings
- **NO auto-execution** (user must copy-paste)

**You're proposing**:
- Execute AI code directly in Rhino
- Access to $50k+ project files
- User may not understand Python

**The Liability Gap**: GitHub warns users. You'd be **executing** code automatically.

---

### What THIS Would Take to Ship Safely

**Minimum Requirements**:
1. **Professional indemnity insurance** ($5k/year)
2. **Security audit** by expert ($10k+)
3. **Terms of service** drafted by lawyer
4. **Docker sandbox** tested on 1,000+ scripts
5. **Undo stack** that survives ALL edge cases

**Cost**: $20k+ **Time**: 6+ months with a team

**For a TFM**: **Not feasible**.

---

## 10. Final Recommendation

### For TFM Grading: ⭐⭐⭐⭐ (Research Demo)

**IF** you build this as a **research prototype** with:
- Clear disclaimers ("Educational use only")
- Dry-run preview mandatory
- Whitelist-only operations
- **Thesis focus on safety architecture**

**THEN** it's a **novel, impressive TFM** that demonstrates:
- LLM integration
- Security awareness
- UI/UX design
- Rhino SDK expertise

**Expected Grade**: 8-9/10 (Innovative but constrained to demo scope)

---

### For Commercial Viability: ❌ **DO NOT SHIP**

**Unless** you have:
- $50k+ funding for security infrastructure
- Legal team for liability protection
- 1-2 years for production hardening

**Warning**: **One viral tweet** about your plugin deleting a user's thesis model = **career-ending lawsuit**.

---

## 11. The Coffee Chat: Final Verdict

**You**: "Should I build the AEC Copilot for my TFM?"  
**Me**: "Are you okay with a demo that WOWs professors but never ships to real users?"  
**You**: "I guess... but I want commercial potential."  
**Me**: "Then do **Semantic Rhino**. Copilot is a research curiosity, not a product."

**You**: "But natural language is the future of CAD!"  
**Me**: "Sure, and **Autodesk will build it in 2028** with 50 engineers and $10M budget. You have 3 months and zero legal team."

**You**: "What if I add perfect sandboxing?"  
**Me**: "Then you've built a PhD thesis, not a TFM. Pick your battles."

---

### The Hierarchy of TFM Options

1. **Semantic Rhino** ⭐⭐⭐⭐⭐ - Ship-ready, commercial moat, zero safety risk
2. **SmartFabricator (Curve-to-Arc)** ⭐⭐⭐⭐ - Practical, scoped, safe
3. **Smart XREF** ⭐⭐⭐ - Safe, clear, lower ceiling
4. **AEC Copilot** ⭐⭐⭐ - Exciting demo, **production nightmare**

---

**FINAL WORD**: 

**"Build tools that lawyers won't sue you for. Natural language + code execution = legal Russian roulette. Save it for your PhD, not your TFM."**

**Recommended Path**: **Choose Semantic Rhino**. It solves a real problem, ships safely, and you can actually charge money for it.
