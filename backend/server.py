# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Dict, Any
import uuid, os, platform, time, psutil
from datetime import datetime, timezone

from database import db, client, logger, get_active_project_version_id
from routers.auth import router as auth_router
from routers.diagrams import router as diagrams_router
from routers.oop_classes import router as oop_classes_router
from routers.social import router as social_router
from routers.components import router as components_router
from routers.git import router as git_router
from routers.projects import router as projects_router
from routers.ai import router as ai_router
from routers.tools import router as tools_router
from routers.i18n import router as i18n_router
from routers.admin import router as admin_router
from routers.shares import router as shares_router
from routers.specs import router as specs_router
from routers.payments import router as payments_router
from routers.admin_billing import router as admin_billing_router
from routers.custom_schemas import router as custom_schemas_router
from routers.issues import router as issues_router
from routers.audit import router as audit_router
from routers.saml_auth import router as saml_router
from routers.ai_generator import router as ai_generator_router
from routers.project_tree import router as project_tree_router
from routers.ai_codegen import router as ai_codegen_router
from routers.google_auth import router as google_auth_router
from routers.announcements import router as announcements_router, seed_demo_announcement_once
from routers.landing_events import router as landing_events_router
from routers.news import router as news_router
from routers.scheduled_tasks import router as scheduled_tasks_router, start_scheduler
from routers.project_files import router as project_files_router
from routers.project_versions import router as project_versions_router
from routers.llm_admin import router as llm_admin_router, public_router as llm_public_router
from routers.api_keys import router as api_keys_router

app = FastAPI(title="BPMN Modeler API")
api_router = APIRouter(prefix="/api")
_APP_STARTUP_TIME = time.monotonic()

# Include all sub-routers
api_router.include_router(auth_router)
api_router.include_router(google_auth_router)
api_router.include_router(diagrams_router)
api_router.include_router(oop_classes_router)
api_router.include_router(social_router)
api_router.include_router(components_router)
api_router.include_router(git_router)
api_router.include_router(projects_router)
api_router.include_router(ai_router)
api_router.include_router(tools_router)
api_router.include_router(i18n_router)
api_router.include_router(admin_router)
api_router.include_router(shares_router)
api_router.include_router(specs_router)
api_router.include_router(payments_router)
api_router.include_router(admin_billing_router)
api_router.include_router(custom_schemas_router)
api_router.include_router(issues_router)
api_router.include_router(audit_router)
api_router.include_router(saml_router)
api_router.include_router(ai_generator_router)
api_router.include_router(project_tree_router)
api_router.include_router(ai_codegen_router)
api_router.include_router(announcements_router)
api_router.include_router(landing_events_router)
api_router.include_router(news_router)
api_router.include_router(scheduled_tasks_router)
api_router.include_router(project_files_router)
api_router.include_router(project_versions_router)
api_router.include_router(llm_admin_router)
api_router.include_router(llm_public_router)
api_router.include_router(api_keys_router)


# ==================== HEALTH CHECK ====================

async def _check_mongodb() -> Dict[str, Any]:
    """Check MongoDB connectivity and measure response time."""
    start = time.monotonic()
    try:
        await client.admin.command("ping")
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        server_info = await client.admin.command("buildInfo")
        return {
            "status": "healthy",
            "latency_ms": latency_ms,
            "version": server_info.get("version", "unknown"),
        }
    except Exception as e:
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        return {"status": "unhealthy", "latency_ms": latency_ms, "error": str(e)}


async def _check_redis() -> Dict[str, Any]:
    """Check Redis connectivity if configured."""
    import cache as _cache
    try:
        await _cache._ensure_redis()
        if _cache._redis:
            start = time.monotonic()
            await _cache._redis.ping()
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            info = await _cache._redis.info("server")
            return {
                "status": "healthy",
                "latency_ms": latency_ms,
                "version": info.get("redis_version", "unknown"),
                "mode": info.get("redis_mode", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "unknown"),
            }
        return {"status": "not_configured", "backend": "memory"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


def _check_system() -> Dict[str, Any]:
    """Gather system-level metrics."""
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    uptime_seconds = round(time.monotonic() - _APP_STARTUP_TIME, 1)
    process = psutil.Process()
    proc_mem = process.memory_info()

    return {
        "uptime_seconds": uptime_seconds,
        "memory": {
            "total_gb": round(mem.total / (1024**3), 2),
            "available_gb": round(mem.available / (1024**3), 2),
            "used_percent": mem.percent,
        },
        "disk": {
            "total_gb": round(disk.total / (1024**3), 2),
            "free_gb": round(disk.free / (1024**3), 2),
            "used_percent": round(disk.percent, 1),
        },
        "process": {
            "pid": process.pid,
            "rss_mb": round(proc_mem.rss / (1024**2), 2),
            "vms_mb": round(proc_mem.vms / (1024**2), 2),
            "threads": process.num_threads(),
            "cpu_percent": process.cpu_percent(interval=0),
        },
        "python": platform.python_version(),
        "platform": platform.system(),
    }


@api_router.get("/")
async def root():
    return {"message": "BPMN Modeler API", "status": "running"}


@api_router.get("/health")
async def health_check():
    """Full health check: verifies MongoDB, Redis, and system resources.

    Returns HTTP 200 if all critical dependencies are healthy, 503 otherwise.
    """
    mongo = await _check_mongodb()
    redis = await _check_redis()
    system = _check_system()

    all_healthy = mongo["status"] == "healthy" and redis["status"] in ("healthy", "not_configured")
    status_code = 200 if all_healthy else 503

    body = {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dependencies": {
            "mongodb": mongo,
            "redis": redis,
        },
        "system": system,
    }
    return JSONResponse(content=body, status_code=status_code)


@api_router.get("/health/live")
async def liveness_probe():
    """Kubernetes-style liveness probe. Returns 200 if the process is running."""
    return {"status": "alive"}


@api_router.get("/health/ready")
async def readiness_probe():
    """Kubernetes-style readiness probe. Returns 200 only if MongoDB is reachable."""
    mongo = await _check_mongodb()
    ready = mongo["status"] == "healthy"
    body = {"status": "ready" if ready else "not_ready", "mongodb": mongo["status"]}
    return JSONResponse(content=body, status_code=200 if ready else 503)


@api_router.get("/health/dependencies")
async def dependency_health():
    """Detailed dependency check with individual status for each service."""
    mongo = await _check_mongodb()
    redis = await _check_redis()

    return {
        "mongodb": mongo,
        "redis": redis,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/health/cache")
async def cache_health():
    import cache as _cache
    return await _cache.health()


# ==================== WEBSOCKET FOR COLLABORATION ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.user_data: Dict[str, Dict[str, dict]] = {}
    
    async def connect(self, websocket: WebSocket, diagram_id: str, user_id: str, user_data: dict):
        await websocket.accept()
        if diagram_id not in self.active_connections:
            self.active_connections[diagram_id] = {}
            self.user_data[diagram_id] = {}
        self.active_connections[diagram_id][user_id] = websocket
        self.user_data[diagram_id][user_id] = user_data
        await self.broadcast_presence(diagram_id)
    
    def disconnect(self, diagram_id: str, user_id: str):
        if diagram_id in self.active_connections:
            self.active_connections[diagram_id].pop(user_id, None)
            self.user_data[diagram_id].pop(user_id, None)
            if not self.active_connections[diagram_id]:
                del self.active_connections[diagram_id]
                del self.user_data[diagram_id]
    
    async def broadcast_presence(self, diagram_id: str):
        if diagram_id in self.active_connections:
            users = list(self.user_data[diagram_id].values())
            message = {"type": "presence", "users": users}
            for ws in self.active_connections[diagram_id].values():
                try:
                    await ws.send_json(message)
                except:
                    pass
    
    async def broadcast_update(self, diagram_id: str, sender_id: str, message: dict):
        if diagram_id in self.active_connections:
            for user_id, ws in self.active_connections[diagram_id].items():
                if user_id != sender_id:
                    try:
                        await ws.send_json(message)
                    except:
                        pass

manager = ConnectionManager()

@app.websocket("/api/ws/diagram/{diagram_id}")
async def websocket_endpoint(websocket: WebSocket, diagram_id: str):
    user_id = str(uuid.uuid4())[:8]
    colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
    user_data = {
        "id": user_id,
        "name": f"User-{user_id}",
        "color": colors[hash(user_id) % len(colors)],
        "cursor": {"x": 0, "y": 0},
        "selected_element": None
    }
    
    await manager.connect(websocket, diagram_id, user_id, user_data)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "cursor":
                user_data["cursor"] = data["position"]
                await manager.broadcast_update(diagram_id, user_id, {
                    "type": "cursor",
                    "user_id": user_id,
                    "user_name": user_data["name"],
                    "color": user_data["color"],
                    "position": data["position"]
                })
            
            elif data["type"] == "select":
                user_data["selected_element"] = data.get("element_id")
                await manager.broadcast_update(diagram_id, user_id, {
                    "type": "select",
                    "user_id": user_id,
                    "user_name": user_data["name"],
                    "element_id": data.get("element_id")
                })
            
            elif data["type"] == "update":
                await manager.broadcast_update(diagram_id, user_id, {
                    "type": "update",
                    "user_id": user_id,
                    "xml": data["xml"]
                })
            
            elif data["type"] == "lock":
                await manager.broadcast_update(diagram_id, user_id, {
                    "type": "lock",
                    "user_id": user_id,
                    "user_name": user_data["name"],
                    "color": user_data["color"],
                    "element_id": data["element_id"]
                })
            
            elif data["type"] == "unlock":
                await manager.broadcast_update(diagram_id, user_id, {
                    "type": "unlock",
                    "user_id": user_id,
                    "element_id": data["element_id"]
                })
    
    except WebSocketDisconnect:
        manager.disconnect(diagram_id, user_id)
        await manager.broadcast_presence(diagram_id)


# ==================== APP SETUP ====================

app.include_router(api_router)

from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')


# ==================== SECURITY HEADERS ====================

class LlmContextMiddleware(BaseHTTPMiddleware):
    """Expose the request path to the LLM gateway metering via contextvars.

    Set before the endpoint runs and reset afterwards; auth helpers set the
    user id once the session is resolved downstream.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        from llm_gateway.context import reset_llm_endpoint, set_llm_endpoint

        token = set_llm_endpoint(request.url.path)
        try:
            return await call_next(request)
        finally:
            reset_llm_endpoint(token)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add standard security headers to all HTTP responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=()",
        )
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
        response.headers.setdefault(
            "Content-Security-Policy",
            (
                "default-src 'self' https: data: blob:; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; "
                "style-src 'self' 'unsafe-inline' https:; "
                "img-src 'self' https: data: blob:; "
                "font-src 'self' https: data:; "
                "connect-src 'self' https: wss: ws:; "
                "frame-ancestors 'self'; "
                "base-uri 'self';"
            ),
        )
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LlmContextMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=500)


# ==================== CORS ====================

def _get_cors_origins() -> list:
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if raw and raw != "*":
        return [o.strip() for o in raw.split(",") if o.strip()]
    frontend_url = os.environ.get("FRONTEND_URL", "").strip()
    origins = []
    if frontend_url:
        origins.append(frontend_url)
    origins.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])
    return origins


_cors_origins = _get_cors_origins()
_cors_allow_all = os.environ.get("CORS_ORIGINS", "").strip() == "*"
_cors_regex = os.environ.get(
    "CORS_ORIGIN_REGEX",
    r"https://([a-z0-9-]+\.)?(preview\.emergentagent\.com|sdd-ia\.com)",
).strip() or None

app.add_middleware(
    CORSMiddleware,
    allow_credentials=not _cors_allow_all,
    allow_origins=["*"] if _cors_allow_all else _cors_origins,
    allow_origin_regex=None if _cors_allow_all else _cors_regex,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    max_age=600,
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def seed_database():
    """Idempotent seeding.

    Behaviour for upgrades / restarts on existing installations:
      - Users / projects / diagrams that already exist are NEVER modified.
      - Demo seeds are recorded in `_seed_runs` after the first successful run
        so that re-runs cannot resurrect entities the user deliberately deleted.
      - Backfill migrations only set MISSING fields; they never overwrite values.
    """
    try:
        # ---- Idempotent role backfill ----
        # Only fills role on users that don't have one yet.
        await db.users.update_many(
            {"role": {"$exists": False}},
            {"$set": {"role": "subscription"}}
        )
        # Backfill is_active for legacy users (treated as active by default).
        await db.users.update_many(
            {"is_active": {"$exists": False}},
            {"$set": {"is_active": True}},
        )
        # Backfill noticias for legacy users (default False).
        await db.users.update_many(
            {"noticias": {"$exists": False}},
            {"$set": {"noticias": False}},
        )
        # Ensure env-declared admin emails keep admin role (safety net).
        # Skip rows that are already admin so we don't issue useless writes.
        admin_emails = [e.strip() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]
        if admin_emails:
            await db.users.update_many(
                {"email": {"$in": admin_emails}, "role": {"$ne": "admin"}},
                {"$set": {"role": "admin"}},
            )

        # ---- Backfill spec.project_version_id for existing specs ----
        specs_need_backfill = await db.specifications.find(
            {
                "project_version_id": {"$exists": False},
                "project_id": {"$ne": None, "$exists": True},
            },
            {"_id": 0, "id": 1, "project_id": 1},
        ).to_list(2000)
        backfilled = 0
        for spec in specs_need_backfill:
            try:
                vid = await get_active_project_version_id(spec["project_id"])
                if vid:
                    await db.specifications.update_one(
                        {"id": spec["id"]},
                        {"$set": {"project_version_id": vid}},
                    )
                    backfilled += 1
            except Exception:
                pass
        if backfilled:
            logger.info(f"Backfilled project_version_id for {backfilled} specs")

        # ---- Migrate projects from baseline+delta to git-like branches ----
        await _migrate_projects_to_branches()

    except Exception as e:
        logger.error(f"Seed error: {e}")


async def _migrate_projects_to_branches():
    """Migrate projects from old baseline+delta+toggle system to branch model.

    For each project that has active_version_ids but no active_branch_id:
    - Creates a default "main" branch with the current project state
    - Assigns branch_id to all existing project_files
    - Sets active_branch_id and default_branch_id on the project
    - Keeps old fields (active_version_ids, baseline_id) for rollback safety

    Idempotent: projects already migrated (with active_branch_id) are skipped.
    """
    from models import ProjectBranch
    from datetime import datetime, timezone

    needs_migration = await db.projects.count_documents({
        "active_branch_id": {"$exists": False},
    })
    if not needs_migration:
        return

    logger.info(f"Branch migration: {needs_migration} projects need migration")
    migrated = 0

    projects_cursor = db.projects.find({"active_branch_id": {"$exists": False}})
    async for project in projects_cursor:
        project_id = project["id"]
        try:
            # Check if any branch already exists for this project
            existing_branch = await db.project_versions.find_one({
                "project_id": project_id,
                "file_ids": {"$exists": True},
            })
            if existing_branch:
                # Branch already created — just update project
                await db.projects.update_one(
                    {"id": project_id},
                    {"$set": {
                        "active_branch_id": existing_branch["id"],
                        "default_branch_id": existing_branch["id"],
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }},
                )
                migrated += 1
                continue

            # Collect existing project files
            files = await db.project_files.find(
                {"project_id": project_id}
            ).to_list(None)
            file_ids = [f["id"] for f in files]

            # Collect existing specs
            specs = await db.specifications.find(
                {"project_id": project_id}, {"id": 1}
            ).to_list(500)
            spec_ids = [s["id"] for s in specs]

            # Collect code generations
            code_gens = await db.code_generations.find(
                {"project_id": project_id}, {"id": 1}
            ).sort("created_at", -1).to_list(10)
            code_ids = [c["id"] for c in code_gens]

            # Create default "main" branch
            now = datetime.now(timezone.utc).isoformat()
            branch = ProjectBranch(
                project_id=project_id,
                name="main",
                description="Default branch (migrated)",
                file_ids=file_ids,
                diagram_ids=project.get("diagram_ids") or [],
                spec_ids=spec_ids,
                code_snapshot_ids=code_ids,
                impact_summary={
                    "files_count": len(file_ids),
                    "diagrams_count": len(project.get("diagram_ids") or []),
                    "specs_count": len(spec_ids),
                    "code_count": len(code_ids),
                },
                is_default=True,
                created_by=project.get("created_by", "system"),
                created_at=now,
            )
            doc = branch.model_dump()
            doc["_id"] = doc["id"]
            await db.project_versions.insert_one(doc)

            # Assign branch_id to all existing project_files
            if file_ids:
                await db.project_files.update_many(
                    {"project_id": project_id},
                    {"$set": {"branch_id": branch.id, "updated_at": now}},
                )

            # Update project
            await db.projects.update_one(
                {"id": project_id},
                {"$set": {
                    "active_branch_id": branch.id,
                    "default_branch_id": branch.id,
                    "updated_at": now,
                }},
            )

            migrated += 1
            logger.info(
                f"Branch migration: created 'main' branch for project {project_id} "
                f"({len(file_ids)} files, {len(spec_ids)} specs)"
            )

        except Exception as exc:
            logger.error(f"Branch migration failed for project {project_id}: {exc}")

    if migrated:
        logger.info(f"Branch migration complete: {migrated} projects migrated")


@app.on_event("startup")
async def ensure_indexes():
    """Create MongoDB indexes for query performance.

    Indexes are idempotent (create_index is no-op if already exists).
    Performance hot paths covered:
      - RLS filtering by created_by
      - Lookups by id (UUID)
      - Diagram → versions/comments aggregations
      - Resource share lookups
    """
    try:
        # UUID id fields (queried heavily everywhere)
        await db.projects.create_index("id", unique=True, sparse=True)
        await db.diagrams.create_index("id", unique=True, sparse=True)
        await db.versions.create_index("id", unique=True, sparse=True)
        await db.branches.create_index("id", unique=True, sparse=True)
        await db.oop_classes.create_index("id", unique=True, sparse=True)
        await db.components.create_index("id", unique=True, sparse=True)
        await db.users.create_index("email")

        # RLS filtering: created_by used by rls_filter / team-metrics
        await db.projects.create_index("created_by")
        await db.diagrams.create_index("created_by")
        await db.versions.create_index("created_by")

        # Foreign keys for joins/aggregations
        await db.versions.create_index([("diagram_id", 1), ("version_number", -1)])
        await db.branches.create_index("diagram_id")
        await db.comments.create_index([("diagram_id", 1), ("created_at", -1)])

        # Specs / requirements (used by dashboard widgets)
        await db.specifications.create_index("project_id")
        await db.requirements.create_index([("spec_id", 1), ("code", 1)])
        await db.requirement_changes.create_index([("created_at", -1)])
        await db.element_requirement_links.create_index([("diagram_id", 1), ("element_id", 1)])

        # Phase snapshots (project tree)
        await db.phase_snapshots.create_index([("project_id", 1), ("phase", 1), ("version", -1)])
        await db.phase_snapshots.create_index("id", unique=True, sparse=True)

        # Code generations (Phase D)
        await db.code_generations.create_index("id", unique=True, sparse=True)
        await db.code_generations.create_index([("project_id", 1), ("created_at", -1)])

        # Landing analytics — TTL 90 days, plus filtering by event_type/anon_id/ts.
        await db.landing_events.create_index("id", unique=True, sparse=True)
        await db.landing_events.create_index([("ts", -1)])
        await db.landing_events.create_index([("event_type", 1), ("ts", -1)])
        await db.landing_events.create_index([("anon_id", 1), ("ts", -1)])
        await db.landing_events.create_index("ts", expireAfterSeconds=60 * 60 * 24 * 90)

        # Announcements
        await db.announcements.create_index("id", unique=True, sparse=True)
        await db.user_announcement_dismissals.create_index([("user_email", 1), ("announcement_id", 1)], unique=True)

        # Seed initial banner (idempotent)
        await seed_demo_announcement_once()

        # Shares (RLS hot path)
        await db.resource_shares.create_index([("user_email", 1), ("resource_type", 1)])
        await db.resource_shares.create_index([("resource_id", 1), ("resource_type", 1)])

        # News posts
        await db.news_posts.create_index("id", unique=True, sparse=True)
        await db.news_posts.create_index([("created_at", -1)])

        # Users by noticias flag (news broadcast queries)
        await db.users.create_index("noticias")
        # GitHub integration
        await db.users.create_index("github_login", sparse=True)
        await db.projects.create_index("github_repo_url", sparse=True)

        # Scheduled tasks
        await db.scheduled_tasks.create_index("id", unique=True, sparse=True)
        await db.scheduled_tasks.create_index([("run_at", 1), ("enabled", 1)])
        await db.task_executions.create_index("id", unique=True, sparse=True)
        await db.task_executions.create_index([("task_id", 1), ("started_at", -1)])

        # Project files (user-managed file/folder tree)
        await db.project_files.create_index("id", unique=True, sparse=True)
        await db.project_files.create_index("project_id")
        await db.project_files.create_index([("project_id", 1), ("parent_id", 1)])
        # Replace old non-branch-aware unique index with one that includes branch_id
        try:
            await db.project_files.drop_index("project_id_1_parent_id_1_name_1")
        except Exception:
            pass  # Index may not exist if this is a fresh DB
        await db.project_files.create_index(
            [("project_id", 1), ("branch_id", 1), ("parent_id", 1), ("name", 1)],
            unique=True
        )

        # Project versioning (baseline + delta patch queue)
        await db.project_baselines.create_index("id", unique=True, sparse=True)
        await db.project_baselines.create_index("project_id", unique=True, sparse=True)
        # Branch indexes (reusing project_versions collection)
        await db.project_versions.create_index("id", unique=True, sparse=True)
        await db.project_versions.create_index([("project_id", 1), ("name", 1)])
        await db.project_versions.create_index([("project_id", 1), ("parent_branch_id", 1)])
        # NOTE: non-unique, so sparse adds nothing; and the prod DB already has
        # this index without sparse — requesting sparse=True raises
        # IndexKeySpecsConflict(86) which aborts the rest of ensure_indexes.
        await db.project_versions.create_index([("project_id", 1), ("version_number", 1)])
        # project_files branch scope
        await db.project_files.create_index([("project_id", 1), ("branch_id", 1)])

        # Sessions (auth hot path)
        await db.sessions.create_index("session_token")
        await db.sessions.create_index("expires_at", expireAfterSeconds=0)

        # LLM gateway usage metering (analytics hot paths)
        await db.llm_usage.create_index([("created_at", -1)])
        await db.llm_usage.create_index([("user_id", 1), ("created_at", -1)])
        await db.llm_usage.create_index([("provider", 1), ("created_at", -1)])

        # LLM provider configs (admin-managed)
        await db.llm_providers.create_index("key", unique=True)

        # User API keys (gateway auth)
        await db.api_keys.create_index("key_id", unique=True, sparse=True)
        await db.api_keys.create_index("key_hash", unique=True)
        await db.api_keys.create_index([("user_id", 1), ("is_active", 1)])

        # API usage tracking (full request/response payloads)
        await db.api_usage.create_index([("user_id", 1), ("created_at", -1)])
        await db.api_usage.create_index("key_id")

        # Seed LLM provider configs from env on first boot (no-op afterwards)
        from routers.ai import LLM_PROVIDER_SEEDS
        from llm_gateway.config_store import seed_providers_from_env
        await seed_providers_from_env(LLM_PROVIDER_SEEDS)

        # Start background scheduler for scheduled tasks
        start_scheduler()

        logger.info("MongoDB indexes verified")
    except Exception as e:
        logger.error(f"Index creation error: {e}")
