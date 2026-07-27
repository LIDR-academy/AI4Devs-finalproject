"""Enrich the LTI demo project with full app data: OOP classes, more
requirements, comments, snapshots/versions per phase, branches, components,
and spec_documents — so the export gives a comprehensive showcase.

Idempotent: re-running just upserts rows.
"""
import asyncio
import sys
import uuid
from datetime import datetime, timezone, timedelta

sys.path.insert(0, "/app/backend")
from database import db  # noqa: E402

PID = "5ad98a45-a536-4fd8-a9e0-051f40d26ce4"
DIDS = [
    "d6d679b3-a1e7-4609-adbe-f4066fc1b38f",  # Flujo Principal LTI
    "0dac3518-e16d-4baf-a575-45a8e7970433",  # Frontend Form
    "8d0ec4cb-05e9-4f0b-af22-afdef63954b5",  # Backend API
]
USER = "system"
NOW = datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat()


# --- OOP Classes (LTI domain) -----------------------------------------------
OOP_CLASSES = [
    {
        "name": "Candidate",
        "category": "lti",
        "description": "Candidato del proceso de selección. Entidad principal del ATS.",
        "tags": ["lti", "core"],
        "properties": [
            {"name": "id", "type": "string", "description": "UUID v4", "required": True},
            {"name": "first_name", "type": "string", "description": "Nombre", "required": True},
            {"name": "last_name", "type": "string", "description": "Apellido", "required": True},
            {"name": "email", "type": "string", "description": "Único, validado regex", "required": True},
            {"name": "phone", "type": "string", "description": "E.164 format", "required": True},
            {"name": "cv_url", "type": "string", "description": "S3 / signed URL al CV", "required": False},
            {"name": "status", "type": "string", "description": "screening|interview|offer|hired|rejected", "required": True},
            {"name": "applied_at", "type": "string", "description": "ISO 8601 timestamp", "required": True},
        ],
    },
    {
        "name": "JobOpening",
        "category": "lti",
        "description": "Oferta de empleo abierta a candidatos.",
        "tags": ["lti", "core"],
        "properties": [
            {"name": "id", "type": "string", "description": "UUID", "required": True},
            {"name": "title", "type": "string", "description": "Título del puesto", "required": True},
            {"name": "department", "type": "string", "description": "Engineering|Sales|HR|...", "required": True},
            {"name": "seniority", "type": "string", "description": "junior|mid|senior|staff", "required": True},
            {"name": "is_active", "type": "boolean", "description": "Visible públicamente", "required": True},
        ],
    },
    {
        "name": "Application",
        "category": "lti",
        "description": "Vinculación entre Candidate y JobOpening.",
        "tags": ["lti", "core"],
        "properties": [
            {"name": "id", "type": "string", "description": "UUID", "required": True},
            {"name": "candidate_id", "type": "string", "description": "FK Candidate", "required": True, "referenceClass": "Candidate"},
            {"name": "job_opening_id", "type": "string", "description": "FK JobOpening", "required": True, "referenceClass": "JobOpening"},
            {"name": "stage", "type": "string", "description": "Estado en pipeline", "required": True},
            {"name": "score", "type": "number", "description": "0-100 evaluación recruiter", "required": False},
        ],
    },
    {
        "name": "Recruiter",
        "category": "lti",
        "description": "Usuario interno con permisos de gestión de candidatos.",
        "tags": ["lti", "user"],
        "properties": [
            {"name": "id", "type": "string", "description": "UUID", "required": True},
            {"name": "email", "type": "string", "description": "Corporate email", "required": True},
            {"name": "name", "type": "string", "description": "Nombre completo", "required": True},
            {"name": "role", "type": "string", "description": "recruiter|admin|hiring_manager", "required": True},
        ],
    },
]


async def seed_oop_classes():
    n = 0
    for cls in OOP_CLASSES:
        existing = await db.oop_classes.find_one({"name": cls["name"], "category": "lti"}, {"_id": 0, "id": 1})
        cid = existing["id"] if existing else str(uuid.uuid4())
        doc = {
            **cls,
            "id": cid,
            "created_by": USER,
            "created_at": iso(NOW),
            "updated_at": iso(NOW),
        }
        await db.oop_classes.update_one({"id": cid}, {"$set": doc}, upsert=True)
        n += 1
    print(f"  ✓ OOP classes upserted: {n}")


# --- Spec documents ---------------------------------------------------------
async def seed_spec_documents(spec_id: str):
    docs = [
        {
            "title": "Functional Spec — Add Candidate",
            "content": (
                "# Functional Spec — Add Candidate\n\n"
                "## Goal\nAllow recruiters to register a new candidate in less than 90 seconds.\n\n"
                "## Scope\n- Web form (responsive)\n- File upload (CV PDF/DOC, max 5 MB)\n- Real-time validation\n- POST `/api/candidates`\n\n"
                "## Out of scope\n- Bulk import (Phase 2)\n- LinkedIn parser (Phase 3)\n\n"
                "## Acceptance criteria\n- Email uniqueness enforced (409 on duplicate)\n- CV stored encrypted at rest\n- Audit log entry per submission\n"
            ),
            "doc_type": "functional",
        },
        {
            "title": "OpenSpec — POST /candidates",
            "content": (
                "openapi: 3.0.3\ninfo:\n  title: LTI Candidates API\n  version: 1.0.0\npaths:\n  /api/candidates:\n    post:\n      summary: Register new candidate\n      requestBody:\n        required: true\n        content:\n          multipart/form-data:\n            schema:\n              type: object\n              properties:\n                first_name: {type: string}\n                last_name: {type: string}\n                email: {type: string, format: email}\n                phone: {type: string}\n                cv: {type: string, format: binary}\n      responses:\n        '201': {description: Created}\n        '409': {description: Email duplicate}\n        '422': {description: Validation error}\n"
            ),
            "doc_type": "openspec",
        },
        {
            "title": "RACI — Add Candidate flow",
            "content": (
                "| Activity | Recruiter | Hiring Mgr | Admin | DevTeam |\n|---|---|---|---|---|\n"
                "| Capture data | R/A | C | I | I |\n| Approve hiring | I | A | I | I |\n"
                "| Maintain UI | I | I | C | R/A |\n| Audit logs | I | I | A | R |\n"
            ),
            "doc_type": "raci",
        },
    ]
    for d in docs:
        existing = await db.spec_documents.find_one({"spec_id": spec_id, "title": d["title"]}, {"_id": 0, "id": 1})
        did = existing["id"] if existing else str(uuid.uuid4())
        await db.spec_documents.update_one(
            {"id": did},
            {"$set": {**d, "id": did, "spec_id": spec_id, "created_by": USER, "created_at": iso(NOW), "updated_at": iso(NOW)}},
            upsert=True,
        )
    print(f"  ✓ Spec documents upserted: {len(docs)}")


# --- Snapshots (Spec-Driven Development phases) -----------------------------
async def seed_snapshots():
    phases = [
        ("ideation", 1, "Initial brief from CEO", {"summary": "Ship LTI MVP in Q3", "audience": "B2B HR teams"}),
        ("requirements", 1, "First MoSCoW pass", {"must_count": 8, "should_count": 5, "could_count": 3, "wont_count": 2}),
        ("specification", 1, "OpenSpec + Speckit drafted", {"endpoints": 4, "entities": 4}),
        ("bpmn", 1, "3 BPMN flows generated", {"diagrams": 3}),
        ("bpmn", 2, "Refinement: extract OptionalFields task", {"diagrams": 3}),
        ("code", 1, "FastAPI + React scaffold", {"backend_files": 12, "frontend_files": 8}),
    ]
    for phase, version, title, extra in phases:
        sid = str(uuid.uuid4())
        await db.snapshots.update_one(
            {"project_id": PID, "phase": phase, "version": version},
            {"$set": {
                "id": sid, "project_id": PID, "phase": phase, "version": version,
                "title": title, "data": extra,
                "created_by": USER, "created_at": iso(NOW),
            }},
            upsert=True,
        )
    print(f"  ✓ Snapshots upserted: {len(phases)}")


# --- Comments on diagram elements -------------------------------------------
async def seed_comments():
    items = [
        (DIDS[1], "FE_FileUpload", "should-have", "Considerar drag&drop con preview del PDF para mejorar UX."),
        (DIDS[1], "FE_ValidateAll", "must-have", "La validación de tamaño debe hacerse en cliente Y servidor."),
        (DIDS[2], "BE_AuthCheck", "must-have", "Aplicar rate-limiting estricto: 10 req/min por IP."),
        (DIDS[2], "BE_StoreCV", "should-have", "S3 + KMS encryption at rest. URL firmada 5 min TTL."),
        (DIDS[0], "Activity_DecideFunnel", "could-have", "Score automático con IA en futuras fases."),
    ]
    # Cleanup any previously-seeded LTI comments that used the wrong schema
    await db.comments.delete_many({"diagram_id": {"$in": DIDS}, "author": USER})
    n = 0
    for did, eid, prio, text in items:
        existing = await db.comments.find_one(
            {"diagram_id": did, "element_id": eid, "content": text},
            {"_id": 0, "id": 1},
        )
        cid = existing["id"] if existing else str(uuid.uuid4())
        await db.comments.update_one(
            {"id": cid},
            {"$set": {
                "id": cid,
                "diagram_id": did,
                "element_id": eid,
                "element_name": eid,
                "content": text,
                "priority": prio,
                "mentions": [],
                "parent_comment_id": None,
                "is_resolved": False,
                "created_by": USER,
                "created_by_name": "Seed Script",
                "created_at": iso(NOW),
            }},
            upsert=True,
        )
        n += 1
    print(f"  ✓ Comments upserted: {n}")


# --- Components (reusable BPMN fragments) -----------------------------------
async def seed_components():
    items = [
        {
            "name": "Auth + Rate Limit Gate",
            "description": "Reusable gateway pattern: JWT auth + role check + rate limit.",
            "category": "security",
            "tags": ["lti", "auth"],
            "is_public": False,
            "xml_fragment": (
                '<bpmn:serviceTask id="ART_Auth" name="JWT auth + rate limit (10/min)"></bpmn:serviceTask>'
            ),
        },
        {
            "name": "File Upload + S3 Encrypt",
            "description": "Drag&drop, validar tamaño, subir a S3 con KMS encryption.",
            "category": "storage",
            "tags": ["lti", "upload"],
            "is_public": False,
            "xml_fragment": (
                '<bpmn:userTask id="ART_Upload" name="Drag&amp;drop CV (max 5MB) + S3 KMS"></bpmn:userTask>'
            ),
        },
    ]
    for c in items:
        existing = await db.components.find_one({"name": c["name"]}, {"_id": 0, "id": 1})
        cid = existing["id"] if existing else str(uuid.uuid4())
        await db.components.update_one(
            {"id": cid},
            {"$set": {
                **c, "id": cid, "preview_image": None, "usage_count": 0,
                "created_by": USER, "created_at": iso(NOW),
            }},
            upsert=True,
        )
    print(f"  ✓ Components upserted: {len(items)}")


# --- Branches per diagram ---------------------------------------------------
async def seed_branches():
    items = [
        (DIDS[0], "feature/multi-stage-funnel", "Añadir etapas: screening → interview → offer"),
        (DIDS[2], "feature/audit-log", "Persistir audit log con cada POST a Mongo audit_logs"),
    ]
    n = 0
    for did, name, desc in items:
        diag = await db.diagrams.find_one({"id": did}, {"_id": 0})
        if not diag:
            continue
        bid = f"br-{did[:6]}-{name.split('/')[1][:14]}"
        await db.branches.update_one(
            {"id": bid},
            {"$set": {
                "id": bid, "diagram_id": did, "name": name, "description": desc,
                "base_version": diag.get("current_version", 1),
                "current_version": diag.get("current_version", 1),
                "current_xml": diag.get("current_xml", ""),
                "status": "active", "is_merged": False,
                "created_by": USER, "created_at": iso(NOW),
            }},
            upsert=True,
        )
        n += 1
    print(f"  ✓ Branches upserted: {n}")


# --- Versions (per diagram, ensure ≥3 each) ---------------------------------
async def seed_versions():
    n_added = 0
    for did in DIDS:
        diag = await db.diagrams.find_one({"id": did}, {"_id": 0})
        if not diag:
            continue
        existing_n = await db.versions.count_documents({"diagram_id": did})
        target = 4
        if existing_n >= target:
            continue
        commit_msgs = [
            "Initial draft from AI",
            "Refinement: split parallel paths",
            "Add error handling for 409/500",
            "Polish labels + element layout",
        ]
        for v in range(existing_n + 1, target + 1):
            vid = str(uuid.uuid4())
            await db.versions.insert_one({
                "id": vid, "diagram_id": did, "version": v,
                "xml": diag.get("current_xml", ""),
                "message": commit_msgs[min(v - 1, len(commit_msgs) - 1)],
                "author": USER, "created_at": iso(NOW - timedelta(hours=24 - v * 3)),
            })
            n_added += 1
    print(f"  ✓ Versions added: {n_added}")


async def main():
    print(f"Enriching LTI project {PID}...")
    await seed_oop_classes()

    spec = await db.specifications.find_one({"project_id": PID}, {"_id": 0})
    if spec:
        await seed_spec_documents(spec["id"])
    else:
        print("  ⚠ No spec for LTI project — skip spec_documents")

    await seed_snapshots()
    await seed_comments()
    await seed_components()
    await seed_branches()
    await seed_versions()

    # Final counts
    print("\n=== Final state ===")
    cols = {
        "oop_classes": {"$or": [{"category": "lti"}]},
        "specifications": {"project_id": PID},
        "spec_documents": {},  # by spec_id, count below
        "requirements": {},
        "element_requirement_links": {"diagram_id": {"$in": DIDS}},
        "versions": {"diagram_id": {"$in": DIDS}},
        "branches": {"diagram_id": {"$in": DIDS}},
        "snapshots": {"project_id": PID},
        "comments": {"diagram_id": {"$in": DIDS}},
        "components": {},
    }
    spec_ids = [s["id"] async for s in db.specifications.find({"project_id": PID}, {"_id": 0, "id": 1})]
    for c, q in cols.items():
        if c == "requirements":
            n = await db[c].count_documents({"spec_id": {"$in": spec_ids}})
        elif c == "spec_documents":
            n = await db[c].count_documents({"spec_id": {"$in": spec_ids}})
        else:
            n = await db[c].count_documents(q)
        print(f"  {c:35s}: {n}")


if __name__ == "__main__":
    asyncio.run(main())
