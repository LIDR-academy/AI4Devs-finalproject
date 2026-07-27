# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Scheduled tasks with DeepSeek execution — CRUD, background scheduler, execution history."""

from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import asyncio
import logging
import uuid
import re

from database import db
from routers.auth import require_admin
from routers.ai import _call_deepseek
from llm_gateway.context import set_llm_endpoint

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/scheduled-tasks", tags=["scheduled-tasks"])

CRON_RE = re.compile(
    r"^(\*|[0-5]?\d)\s+(\*|1?\d|2[0-3])\s+(\*|[12]?\d|3[01])\s+(\*|1?\d|12)\s+(\*|[0-6])$"
)

_scheduler_task: asyncio.Task | None = None


def _parse_cron(cron: str, from_dt: datetime | None = None) -> datetime:
    """Naive cron parser — returns next fire time. Supports 5-field cron."""
    from_dt = from_dt or datetime.now(timezone.utc)
    parts = cron.strip().split()
    minute, hour, dom, month, dow = parts

    # Build list of allowed values
    def _vals(field: str, lo: int, hi: int) -> set[int]:
        if field == "*":
            return set(range(lo, hi + 1))
        return {int(x) for x in field.split(",")}

    minutes = _vals(minute, 0, 59)
    hours = _vals(hour, 0, 23)
    doms = _vals(dom, 1, 31)
    months = _vals(month, 1, 12)
    dows = _vals(dow, 0, 6)

    dt = from_dt.replace(second=0, microsecond=0)  # Start from current minute
    for _ in range(366 * 24 * 60):  # Max 1 year search
        dt = dt.replace(minute=dt.minute + 1) if dt.minute < 59 else dt.replace(minute=0, hour=dt.hour + 1 if dt.hour < 23 else 0)
        if dt.hour == 0 and dt.minute == 0:
            dt = dt.replace(day=dt.day + 1) if dt.day < 28 else _next_month(dt)
        if (
            dt.minute in minutes
            and dt.hour in hours
            and dt.day in doms
            and dt.month in months
            and dt.weekday() in dows
        ):
            return dt
    return from_dt + __import__("datetime").timedelta(days=365)


def _next_month(dt: datetime) -> datetime:
    """Advance to day 1 of next month."""
    if dt.month == 12:
        return dt.replace(year=dt.year + 1, month=1, day=1)
    return dt.replace(month=dt.month + 1, day=1)


# ==================== BACKGROUND SCHEDULER ====================

async def _scheduler_loop():
    """Check for due tasks every 30 seconds and execute them."""
    while True:
        try:
            now = datetime.now(timezone.utc)
            due = await db.scheduled_tasks.find(
                {"enabled": True, "run_at": {"$lte": now}, "status": {"$ne": "running"}},
                {"_id": 0},
            ).to_list(100)

            for task in due:
                task_id = task["id"]
                # Atomically claim the task
                claimed = await db.scheduled_tasks.update_one(
                    {"id": task_id, "status": {"$ne": "running"}},
                    {"$set": {"status": "running"}},
                )
                if claimed.modified_count == 0:
                    continue

                exec_id = str(uuid.uuid4())
                started = datetime.now(timezone.utc)
                logger.info("Running scheduled task id=%s name=%s", task_id, task.get("name", ""))

                try:
                    system = task.get("system_prompt", "") or "Eres un asistente util."
                    set_llm_endpoint("background:scheduled-task")
                    response = await _call_deepseek(
                        system_msg=system,
                        user_msg=task["prompt"],
                        max_tokens=task.get("max_tokens", 4096),
                        model=task.get("model", "deepseek-v4-pro"),
                    )
                    finished = datetime.now(timezone.utc)
                    duration_ms = int((finished - started).total_seconds() * 1000)
                    await db.task_executions.insert_one({
                        "id": exec_id,
                        "task_id": task_id,
                        "task_name": task.get("name", ""),
                        "prompt": task["prompt"],
                        "response": response,
                        "status": "success",
                        "error_message": None,
                        "model": task.get("model", "deepseek-v4-pro"),
                        "started_at": started,
                        "finished_at": finished,
                        "duration_ms": duration_ms,
                    })
                    await db.scheduled_tasks.update_one(
                        {"id": task_id},
                        {"$set": {"status": "idle", "last_run_at": finished, "last_status": "success"}},
                    )
                    logger.info("Task %s completed in %sms", task_id, duration_ms)
                except Exception as e:
                    finished = datetime.now(timezone.utc)
                    duration_ms = int((finished - started).total_seconds() * 1000)
                    await db.task_executions.insert_one({
                        "id": exec_id,
                        "task_id": task_id,
                        "task_name": task.get("name", ""),
                        "prompt": task["prompt"],
                        "response": None,
                        "status": "error",
                        "error_message": str(e)[:2000],
                        "model": task.get("model", "deepseek-v4-pro"),
                        "started_at": started,
                        "finished_at": finished,
                        "duration_ms": duration_ms,
                    })
                    await db.scheduled_tasks.update_one(
                        {"id": task_id},
                        {"$set": {"status": "idle", "last_run_at": finished, "last_status": "error"}},
                    )
                    logger.error("Task %s failed: %s", task_id, e)

                # Re-read cron (may have changed via PUT during execution)
                refreshed = await db.scheduled_tasks.find_one({"id": task_id}, {"_id": 0, "cron_expression": 1})
                cron = (refreshed.get("cron_expression") or "").strip() if refreshed else ""
                if cron:
                    next_run = _parse_cron(cron, finished)
                    await db.scheduled_tasks.update_one(
                        {"id": task_id},
                        {"$set": {"run_at": next_run}},
                    )
                else:
                    # One-shot task — disable so it doesn't re-execute every 30s
                    await db.scheduled_tasks.update_one(
                        {"id": task_id},
                        {"$set": {"enabled": False}},
                    )

        except Exception as e:
            logger.error("Scheduler loop error: %s", e)

        await asyncio.sleep(30)


def start_scheduler():
    global _scheduler_task
    if _scheduler_task is None or _scheduler_task.done():
        _scheduler_task = asyncio.create_task(_scheduler_loop())
        logger.info("Scheduled task runner started")


# ==================== ENDPOINTS ====================

@router.get("")
async def list_tasks(request: Request):
    """List all scheduled tasks (admin only)."""
    await require_admin(request)
    tasks = await db.scheduled_tasks.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"tasks": tasks}


@router.post("")
async def create_task(request: Request):
    """Create a scheduled task (admin only).

    Body:
      - name (str, required)
      - prompt (str, required)
      - system_prompt (str, optional)
      - cron_expression (str, optional): 5-field cron, e.g. "0 9 * * *"
      - run_at (ISO str, optional): one-shot datetime; if neither cron nor run_at given, defaults to now
      - model (str, optional): defaults to "deepseek-v4-pro"
      - max_tokens (int, optional): defaults to 4096
      - enabled (bool, optional): defaults to True
    """
    await require_admin(request)
    body = await request.json()

    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "name is required")
    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        raise HTTPException(400, "prompt is required")

    cron = (body.get("cron_expression") or "").strip()
    if cron and not CRON_RE.match(cron):
        raise HTTPException(400, "Invalid cron expression (5-field: min hour dom month dow)")

    run_at_str = (body.get("run_at") or "").strip()
    now = datetime.now(timezone.utc)
    if cron:
        run_at = _parse_cron(cron, now)
    elif run_at_str:
        run_at = datetime.fromisoformat(run_at_str)
        if run_at.tzinfo is None:
            raise HTTPException(400, "run_at must include timezone offset")
    else:
        run_at = now  # Immediate

    task_id = str(uuid.uuid4())
    doc = {
        "id": task_id,
        "name": name,
        "prompt": prompt,
        "system_prompt": (body.get("system_prompt") or "").strip() or "Eres un asistente util.",
        "cron_expression": cron or None,
        "run_at": run_at,
        "model": (body.get("model") or "deepseek-v4-pro").strip(),
        "max_tokens": int(body.get("max_tokens", 4096)),
        "enabled": body.get("enabled", True),
        "status": "idle",
        "last_run_at": None,
        "last_status": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.scheduled_tasks.insert_one(doc)
    # Serialize datetimes for JSON response
    doc["run_at"] = doc["run_at"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    return {"status": "ok", "task": doc}


@router.put("/{task_id}")
async def update_task(task_id: str, request: Request):
    """Update a scheduled task. Body same as create (all fields optional)."""
    await require_admin(request)
    body = await request.json()

    existing = await db.scheduled_tasks.find_one({"id": task_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Task not found")

    updates = {}
    for key in ("name", "prompt", "system_prompt", "model"):
        if key in body and body[key] is not None:
            updates[key] = str(body[key]).strip() if key != "model" else str(body[key]).strip()
    if "cron_expression" in body:
        cron_val = (body.get("cron_expression") or "").strip()
        updates["cron_expression"] = cron_val if cron_val else None
    if "max_tokens" in body and body["max_tokens"] is not None:
        updates["max_tokens"] = int(body["max_tokens"])
    if "enabled" in body and body["enabled"] is not None:
        updates["enabled"] = bool(body["enabled"])

    run_at_str = (body.get("run_at") or "").strip()
    if run_at_str:
        run_at = datetime.fromisoformat(run_at_str)
        if run_at.tzinfo is None:
            raise HTTPException(400, "run_at must include timezone offset")
        updates["run_at"] = run_at

    if "cron_expression" in updates:
        cron = (updates["cron_expression"] or "").strip()
    else:
        cron = (existing.get("cron_expression") or "").strip()
    if cron and "run_at" not in updates:
        updates["run_at"] = _parse_cron(cron)

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.scheduled_tasks.update_one({"id": task_id}, {"$set": updates})

    updated = await db.scheduled_tasks.find_one({"id": task_id}, {"_id": 0})
    return {"status": "ok", "task": updated}


@router.delete("/{task_id}")
async def delete_task(task_id: str, request: Request):
    """Delete a scheduled task and its execution history."""
    await require_admin(request)
    result = await db.scheduled_tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Task not found")
    await db.task_executions.delete_many({"task_id": task_id})
    return {"status": "ok", "message": "Task and executions deleted"}


@router.post("/{task_id}/run")
async def run_now(task_id: str, request: Request):
    """Trigger immediate execution of a task (sets run_at=now)."""
    await require_admin(request)
    now = datetime.now(timezone.utc)
    result = await db.scheduled_tasks.update_one(
        {"id": task_id},
        {"$set": {"run_at": now, "enabled": True, "status": "idle", "updated_at": now}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Task not found")
    return {"status": "ok", "message": "Task queued for immediate execution"}


@router.get("/{task_id}/executions")
async def list_executions(task_id: str, request: Request, limit: int = Query(50, ge=1, le=500)):
    """List execution history for a task (newest first)."""
    await require_admin(request)
    execs = await db.task_executions.find(
        {"task_id": task_id}, {"_id": 0}
    ).sort("started_at", -1).limit(limit).to_list(500)
    return {"executions": execs}
