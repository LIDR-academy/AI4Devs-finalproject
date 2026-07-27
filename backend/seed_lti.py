# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Seeds rich demo data for the LTI project so every feature is showcased.

Run from /app/backend:
    python3 seed_lti.py

Idempotent: safe to re-run; existing items (matched by id/code) are upserted.
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

PROJECT_NAME = "LTI"
DIAG_MAIN = "d6d679b3-a1e7-4609-adbe-f4066fc1b38f"
DIAG_FRONT = "0dac3518-e16d-4baf-a575-45a8e7970433"
DIAG_BACK = "8d0ec4cb-05e9-4f0b-af22-afdef63954b5"


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    project = await db.projects.find_one({"name": PROJECT_NAME}, {"_id": 0})
    if not project:
        raise SystemExit("LTI project not found")

    project_id = project["id"]
    owner = project.get("created_by") or "oscar.hidalgo.puertas@gmail.com"
    now = datetime.now(timezone.utc).isoformat()
    print(f"Seeding LTI project: {project_id} (owner={owner})")

    # ---------- 1. Project metadata ----------
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "description": (
                "Plataforma LTI de gestion de talento. Modela el flujo end-to-end "
                "de registro de candidatos con frontend responsive, backend seguro "
                "(JWT + RBAC), validacion en cliente y servidor, anti-duplicados, "
                "almacenamiento de CV en Cloud Storage y auditoria."
            ),
            "tags": ["recruiting", "lti", "candidates", "talent", "rbac"],
            "color": "#2563EB",
            "icon": "rocket",
            "updated_at": now,
        }},
    )
    print("  ✓ project metadata updated")

    # ---------- 2. OOP Classes ----------
    oop_seed = [
        {
            "id": "lti-cls-candidate",
            "name": "Candidate",
            "category": "entity",
            "description": "Candidato registrado en la plataforma LTI",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "firstName", "type": "string", "required": True},
                {"name": "lastName", "type": "string", "required": True},
                {"name": "email", "type": "email", "required": True},
                {"name": "phone", "type": "string", "required": True},
                {"name": "address", "type": "string", "required": False},
                {"name": "education", "type": "string", "required": False},
                {"name": "experienceYears", "type": "int", "required": False},
                {"name": "cvUrl", "type": "url", "required": True},
                {"name": "createdAt", "type": "datetime", "required": True},
            ],
        },
        {
            "id": "lti-cls-recruiter",
            "name": "Recruiter",
            "category": "actor",
            "description": "Usuario interno (Recruiter o Admin) que registra candidatos",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "name", "type": "string", "required": True},
                {"name": "email", "type": "email", "required": True},
                {"name": "role", "type": "enum:recruiter|admin", "required": True},
            ],
        },
        {
            "id": "lti-cls-cv",
            "name": "CV",
            "category": "entity",
            "description": "Archivo de curriculum subido por el candidato",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "fileName", "type": "string", "required": True},
                {"name": "mimeType", "type": "enum:pdf|doc|docx", "required": True},
                {"name": "sizeBytes", "type": "int", "required": True},
                {"name": "storageUrl", "type": "url", "required": True},
                {"name": "candidateId", "type": "uuid", "required": True},
            ],
        },
        {
            "id": "lti-cls-job-offer",
            "name": "JobOffer",
            "category": "entity",
            "description": "Oferta de empleo a la que se puede asociar un candidato",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "title", "type": "string", "required": True},
                {"name": "department", "type": "string", "required": True},
                {"name": "openings", "type": "int", "required": True},
                {"name": "status", "type": "enum:open|closed", "required": True},
            ],
        },
        {
            "id": "lti-cls-application",
            "name": "Application",
            "category": "event",
            "description": "Postulacion de un candidato a una oferta",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "candidateId", "type": "uuid", "required": True},
                {"name": "jobOfferId", "type": "uuid", "required": True},
                {"name": "status", "type": "enum:pending|reviewing|hired|rejected", "required": True},
                {"name": "appliedAt", "type": "datetime", "required": True},
            ],
        },
        {
            "id": "lti-cls-audit-log",
            "name": "AuditLog",
            "category": "log",
            "description": "Registro de auditoria de operaciones criticas",
            "properties": [
                {"name": "id", "type": "uuid", "required": True},
                {"name": "actor", "type": "string", "required": True},
                {"name": "action", "type": "string", "required": True},
                {"name": "resourceType", "type": "string", "required": True},
                {"name": "resourceId", "type": "uuid", "required": True},
                {"name": "timestamp", "type": "datetime", "required": True},
            ],
        },
    ]
    for cls in oop_seed:
        cls.setdefault("created_by", owner)
        cls.setdefault("created_at", now)
        cls["updated_at"] = now
        cls["project_id"] = project_id
        await db.oop_classes.update_one({"id": cls["id"]}, {"$set": cls}, upsert=True)
    print(f"  ✓ {len(oop_seed)} OOP classes upserted")

    # ---------- 3. Components ----------
    components_seed = [
        {
            "id": "lti-cmp-validate-form",
            "name": "ValidateClientForm",
            "category": "Validacion",
            "description": "Pattern: validacion en cliente con regex y feedback inline",
            "icon": "check-circle",
        },
        {
            "id": "lti-cmp-upload-cv",
            "name": "UploadCV",
            "category": "Archivos",
            "description": "Drag-and-drop con preview, validacion mime/tamano, multipart upload",
            "icon": "upload",
        },
        {
            "id": "lti-cmp-duplicate-check",
            "name": "DuplicateEmailCheck",
            "category": "Verificacion",
            "description": "Query indexado por email para evitar duplicados",
            "icon": "search",
        },
        {
            "id": "lti-cmp-cloud-storage",
            "name": "StoreCloudStorage",
            "category": "Integracion",
            "description": "Subida a S3/GCS con encriptacion at-rest y signed URLs",
            "icon": "cloud",
        },
        {
            "id": "lti-cmp-toast-notify",
            "name": "ToastNotification",
            "category": "UI",
            "description": "Notificaciones toast con sonner (success/error/info)",
            "icon": "bell",
        },
        {
            "id": "lti-cmp-audit-log",
            "name": "AuditLogWriter",
            "category": "Seguridad",
            "description": "Componente reutilizable para escribir logs de auditoria",
            "icon": "shield",
        },
    ]
    for cmp in components_seed:
        cmp.setdefault("created_by", owner)
        cmp.setdefault("created_at", now)
        cmp["updated_at"] = now
        cmp["project_id"] = project_id
        await db.components.update_one({"id": cmp["id"]}, {"$set": cmp}, upsert=True)
    print(f"  ✓ {len(components_seed)} components upserted")

    # ---------- 4. Specification + Requirements (OpenSpec + Speckit) ----------
    spec_id = "lti-spec-onboarding"
    spec_doc = {
        "id": spec_id,
        "project_id": project_id,
        "title": "Onboarding de Candidatos LTI",
        "description": "Especificacion completa del flujo de registro de candidatos con criterios de aceptacion, RACI y prioridades MoSCoW.",
        "mode": "full",  # openspec + speckit
        "tags": ["onboarding", "candidates", "lti"],
        "linked_diagrams": [DIAG_MAIN, DIAG_FRONT, DIAG_BACK],
        "speckit_outdated": False,
        "created_by": owner,
        "created_at": now,
        "updated_at": now,
    }
    await db.specifications.update_one({"id": spec_id}, {"$set": spec_doc}, upsert=True)

    requirements_seed = [
        # Functional Requirements
        ("FR-001", "Validacion email unico", "El sistema debe rechazar registros con un email ya existente, retornando HTTP 409 Conflict.", "must", "functional",
         {"responsible": ["dev_lead@lti.com"], "accountable": ["pm@lti.com"], "consulted": ["security@lti.com"], "informed": ["qa@lti.com"]},
         [DIAG_MAIN, DIAG_BACK]),
        ("FR-002", "Carga de CV PDF/DOC max 5MB", "Permitir subir CV en formato PDF/DOC/DOCX con tamano maximo 5 MB. Rechazar otros tipos.", "must", "functional",
         {"responsible": ["frontend@lti.com", "dev_lead@lti.com"], "accountable": ["pm@lti.com"], "consulted": ["security@lti.com"], "informed": ["qa@lti.com"]},
         [DIAG_FRONT, DIAG_BACK]),
        ("FR-003", "Validaciones client-side real-time", "Email regex, campos obligatorios y tamano de archivo deben validarse al instante con feedback inline.", "should", "functional",
         {"responsible": ["frontend@lti.com"], "accountable": ["dev_lead@lti.com"], "consulted": ["ux@lti.com"], "informed": ["qa@lti.com"]},
         [DIAG_FRONT]),
        ("FR-004", "Drag-and-drop con preview de CV", "El uploader debe soportar drag-and-drop con previsualizacion del PDF.", "should", "functional",
         {"responsible": ["frontend@lti.com"], "accountable": ["dev_lead@lti.com"], "consulted": ["ux@lti.com"], "informed": []},
         [DIAG_FRONT]),
        ("FR-005", "Notificacion email de bienvenida", "Enviar email automatico al candidato cuando se registra correctamente.", "could", "functional",
         {"responsible": ["backend@lti.com"], "accountable": ["pm@lti.com"], "consulted": ["marketing@lti.com"], "informed": ["qa@lti.com"]},
         [DIAG_BACK]),
        ("FR-006", "Importacion masiva via CSV", "Permitir cargar multiples candidatos desde archivo CSV.", "wont", "functional",
         {"responsible": [], "accountable": ["pm@lti.com"], "consulted": [], "informed": []},
         []),
        # Non-Functional Requirements
        ("NFR-001", "Sanitizacion XSS / SQL Injection", "Todos los inputs deben sanitizarse server-side antes de persistir.", "must", "non_functional",
         {"responsible": ["security@lti.com", "backend@lti.com"], "accountable": ["dev_lead@lti.com"], "consulted": [], "informed": ["qa@lti.com"]},
         [DIAG_BACK]),
        ("NFR-002", "Accesibilidad WCAG 2.1 AA", "Todos los formularios deben cumplir WCAG 2.1 nivel AA.", "should", "non_functional",
         {"responsible": ["frontend@lti.com"], "accountable": ["ux@lti.com"], "consulted": [], "informed": ["legal@lti.com"]},
         [DIAG_FRONT]),
        ("NFR-003", "Cloud Storage con encriptacion at-rest", "El CV debe almacenarse cifrado AES-256 en Cloud Storage con TTL de signed URL = 1h.", "must", "non_functional",
         {"responsible": ["security@lti.com"], "accountable": ["devops@lti.com"], "consulted": ["legal@lti.com"], "informed": []},
         [DIAG_BACK]),
        ("NFR-004", "Latencia formulario < 500ms", "El P95 del POST /candidates debe ser inferior a 500ms en condiciones normales.", "should", "non_functional",
         {"responsible": ["backend@lti.com"], "accountable": ["devops@lti.com"], "consulted": [], "informed": ["qa@lti.com"]},
         [DIAG_BACK]),
        ("NFR-005", "Auditoria de operaciones criticas", "Toda creacion/edicion/eliminacion de candidato debe registrarse en audit log inmutable.", "must", "non_functional",
         {"responsible": ["backend@lti.com"], "accountable": ["security@lti.com"], "consulted": ["legal@lti.com"], "informed": []},
         [DIAG_BACK]),
    ]

    for code, title, desc, moscow, kind, raci, linked_diagrams in requirements_seed:
        rid = f"lti-req-{code.lower().replace('-', '')}"
        req_doc = {
            "id": rid,
            "spec_id": spec_id,
            "code": code,
            "title": title,
            "description": desc,
            "moscow": moscow,
            "kind": kind,
            "raci": raci,
            "linked_diagrams": linked_diagrams,
            "tags": [kind],
            "created_by": owner,
            "created_at": now,
            "updated_at": now,
        }
        await db.requirements.update_one({"id": rid}, {"$set": req_doc}, upsert=True)
    print(f"  ✓ 1 spec + {len(requirements_seed)} requirements upserted")

    # ---------- 5. Element-requirement links (drives MoSCoW colors on canvas) ----------
    element_links = [
        # FR-001 unique email
        (DIAG_MAIN, "Task_CheckDuplicate", "lti-req-fr001"),
        (DIAG_MAIN, "GW_Duplicate", "lti-req-fr001"),
        (DIAG_BACK, "BE_CheckDuplicate", "lti-req-fr001"),
        # FR-002 CV upload
        (DIAG_MAIN, "Task_UploadCV", "lti-req-fr002"),
        (DIAG_FRONT, "FE_FileUpload", "lti-req-fr002"),
        (DIAG_BACK, "BE_ValidateFile", "lti-req-fr002"),
        # FR-003 client-side validation
        (DIAG_MAIN, "Task_ValidateClient", "lti-req-fr003"),
        (DIAG_FRONT, "FE_ValidateAll", "lti-req-fr003"),
        # FR-004 drag and drop
        (DIAG_FRONT, "FE_FileUpload", "lti-req-fr004"),
        # FR-005 email notification
        (DIAG_MAIN, "Task_ShowSuccess", "lti-req-fr005"),
        # NFR-001 sanitization
        (DIAG_MAIN, "Task_ServerValidate", "lti-req-nfr001"),
        (DIAG_BACK, "BE_Sanitize", "lti-req-nfr001"),
        (DIAG_BACK, "BE_ValidateServer", "lti-req-nfr001"),
        # NFR-002 accessibility
        (DIAG_FRONT, "FE_RenderForm", "lti-req-nfr002"),
        # NFR-003 cloud storage
        (DIAG_MAIN, "Task_UploadStorage", "lti-req-nfr003"),
        (DIAG_BACK, "BE_UploadCloud", "lti-req-nfr003"),
        # NFR-005 audit
        (DIAG_BACK, "BE_AuditLog", "lti-req-nfr005"),
    ]
    for did, eid, req_id in element_links:
        link_id = f"lnk-{did[:6]}-{eid}-{req_id[-6:]}"
        await db.element_requirement_links.update_one(
            {"id": link_id},
            {"$set": {
                "id": link_id,
                "diagram_id": did,
                "element_id": eid,
                "requirement_id": req_id,
                "created_by": owner,
                "created_at": now,
            }},
            upsert=True,
        )
    print(f"  ✓ {len(element_links)} element-requirement links upserted")

    # ---------- 6. Comments ----------
    comments_seed = [
        (DIAG_MAIN, "Task_UploadCV", "Validar tambien con virusscan antes de subir a Cloud Storage.", "security@lti.com"),
        (DIAG_FRONT, "FE_FileUpload", "Anadir indicador visual de progreso de carga (porcentaje + barra).", "ux@lti.com"),
        (DIAG_BACK, "BE_AuditLog", "El log debe ser inmutable (append-only) para cumplir GDPR.", "legal@lti.com"),
        (DIAG_MAIN, "GW_Duplicate", "Considerar tambien deteccion por DNI/NIE en el futuro.", "pm@lti.com"),
    ]
    for did, eid, content, by in comments_seed:
        cid = f"cmt-{did[:6]}-{eid}-{by[:5]}"
        await db.comments.update_one(
            {"id": cid},
            {"$set": {
                "id": cid,
                "diagram_id": did,
                "element_id": eid,
                "content": content,
                "created_by": by,
                "created_by_name": by.split("@")[0],
                "created_at": now,
            }},
            upsert=True,
        )
    print(f"  ✓ {len(comments_seed)} comments upserted")

    # ---------- 7. Branches ----------
    branches_seed = [
        (DIAG_FRONT, "feature/drag-drop-preview", "Mejorar el FE_FileUpload con preview embebido del PDF"),
        (DIAG_BACK, "feature/email-notification", "Implementar FR-005 (email de bienvenida) tras login OAuth"),
    ]
    for diag_id, name, desc in branches_seed:
        diag = await db.diagrams.find_one({"id": diag_id}, {"_id": 0})
        bid = f"br-{diag_id[:6]}-{name.split('/')[-1][:10]}"
        await db.branches.update_one(
            {"id": bid},
            {"$set": {
                "id": bid,
                "diagram_id": diag_id,
                "name": name,
                "description": desc,
                "base_version": diag.get("current_version", 1),
                "current_xml": diag.get("current_xml", ""),
                "current_version": diag.get("current_version", 1),
                "status": "active",
                "is_merged": False,
                "created_by": owner,
                "created_at": now,
            }},
            upsert=True,
        )
    print(f"  ✓ {len(branches_seed)} branches upserted")

    # ---------- 8. Requirement change (Impact of Change widget) ----------
    rank = {"must": 4, "should": 3, "could": 2, "wont": 1}
    diag_main_meta = await db.diagrams.find_one({"id": DIAG_MAIN}, {"_id": 0, "name": 1})
    diag_front_meta = await db.diagrams.find_one({"id": DIAG_FRONT}, {"_id": 0, "name": 1})

    # FR-005 escalates from "could" to "must"
    await db.requirement_changes.update_one(
        {"id": "chg-lti-fr005-escalate"},
        {"$set": {
            "id": "chg-lti-fr005-escalate",
            "requirement_id": "lti-req-fr005",
            "requirement_code": "FR-005",
            "requirement_title": "Notificacion email de bienvenida",
            "spec_id": spec_id,
            "from_moscow": "could",
            "to_moscow": "must",
            "escalation": rank["must"] - rank["could"],
            "changed_by": owner,
            "changed_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "affected_elements": [{"diagram_id": DIAG_MAIN, "element_id": "Task_ShowSuccess", "element_name": "Toast: Candidato registrado"}],
            "affected_diagrams": [{"id": DIAG_MAIN, "name": diag_main_meta["name"]}],
            "raci_notify": ["backend@lti.com", "pm@lti.com", "marketing@lti.com", "qa@lti.com"],
            "acknowledged": False,
            "acknowledged_by": [],
        }},
        upsert=True,
    )

    # NFR-002 escalates from "should" to "must"
    await db.requirement_changes.update_one(
        {"id": "chg-lti-nfr002-escalate"},
        {"$set": {
            "id": "chg-lti-nfr002-escalate",
            "requirement_id": "lti-req-nfr002",
            "requirement_code": "NFR-002",
            "requirement_title": "Accesibilidad WCAG 2.1 AA",
            "spec_id": spec_id,
            "from_moscow": "should",
            "to_moscow": "must",
            "escalation": rank["must"] - rank["should"],
            "changed_by": owner,
            "changed_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "affected_elements": [{"diagram_id": DIAG_FRONT, "element_id": "FE_RenderForm", "element_name": "Renderizar formulario"}],
            "affected_diagrams": [{"id": DIAG_FRONT, "name": diag_front_meta["name"]}],
            "raci_notify": ["frontend@lti.com", "ux@lti.com", "legal@lti.com"],
            "acknowledged": False,
            "acknowledged_by": [],
        }},
        upsert=True,
    )
    print("  ✓ 2 requirement_changes (escalations) upserted")

    print("\nDone. LTI project now showcases ALL features:")
    print("  - 6 OOP classes  - 6 components")
    print("  - 1 spec (full mode) with 11 requirements (Must/Should/Could/Won't + RACI)")
    print("  - 18 element-requirement links (auto MoSCoW colors on canvas)")
    print("  - 4 comments  - 2 feature branches")
    print("  - 2 priority escalations (Impact of Change widget)")


if __name__ == "__main__":
    asyncio.run(main())
