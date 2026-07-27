# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional
import uuid
import base64
from datetime import datetime, timezone
import httpx

from database import db
from models import GitRepository, GitRepositoryCreate
from routers.auth import get_current_user
import logging

router = APIRouter(tags=["git"])
logger = logging.getLogger(__name__)


def _parse_github_url(repo_url: str):
    repo_url = repo_url.rstrip("/")
    parts = repo_url.replace("https://github.com/", "").split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid repository URL")
    return parts[0], parts[1].replace(".git", "")


async def _resolve_pat(user_email: str, repo_doc: dict) -> str:
    """Resolve the GitHub access token for a repo connection.

    Priority:
    1. Legacy: repo-level access_token (still works, logs deprecation warning).
    2. User-level: github_access_token stored on the user document.
    """
    if repo_doc.get("access_token"):
        logger.warning("Legacy PAT in use for repo %s — consider migrating to user-level token", repo_doc.get("id"))
        return repo_doc["access_token"]
    user_doc = await db.users.find_one({"email": user_email}, {"_id": 0, "github_access_token": 1})
    token = user_doc.get("github_access_token") if user_doc else None
    if not token:
        raise HTTPException(status_code=401, detail="GitHub not connected. Use PUT /api/auth/me/github first.")
    return token


@router.get("/git-repos")
async def get_git_repos(request: Request, project_id: Optional[str] = None):
    user = await get_current_user(request)
    if not user:
        return []
    query: dict = {"created_by": {"$in": [user.email, user.user_id]}}
    if project_id:
        query["project_id"] = project_id
    repos = await db.git_repos.find(query, {"_id": 0, "access_token": 0}).to_list(50)
    return repos


@router.post("/git-repos")
async def create_git_repo(data: GitRepositoryCreate, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    repo = GitRepository(**data.model_dump())
    repo.created_by = user.email

    doc = repo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_sync'):
        doc['last_sync'] = doc['last_sync'].isoformat()
    insert_doc = doc.copy()
    await db.git_repos.insert_one(insert_doc)

    doc.pop('access_token', None)
    logger.info("Git repo created: user=%s repo_id=%s url=%s", user.email, repo.id, repo.repository_url)
    return doc


@router.delete("/git-repos/{repo_id}")
async def delete_git_repo(repo_id: str):
    result = await db.git_repos.delete_one({"id": repo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Repository not found")
    logger.info("Git repo deleted: repo_id=%s", repo_id)
    return {"message": "Repository deleted"}


@router.post("/git-repos/{repo_id}/push")
async def git_push(repo_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    repo = await db.git_repos.find_one({"id": repo_id}, {"_id": 0})
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    body = {}
    try:
        body = await request.json()
    except:
        pass
    diagram_id = body.get("diagram_id", repo.get("diagram_id"))
    
    if not diagram_id:
        raise HTTPException(status_code=400, detail="No diagram specified")
    
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    owner, repo_name = _parse_github_url(repo["repository_url"])
    token = await _resolve_pat(user.email, repo)
    sync_path = repo.get("sync_path", "bpmn/")
    file_name = diagram["name"].replace(" ", "_").replace("/", "-") + ".bpmn"
    file_path = f"{sync_path}{file_name}"
    branch = repo.get("default_branch", "main")

    logger.info("Git push (legacy): user=%s repo=%s/%s diagram=%s file=%s", user.email, owner, repo_name, diagram["name"], file_path)

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        sha = None
        existing = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}?ref={branch}",
            headers=headers
        )
        if existing.status_code == 200:
            sha = existing.json().get("sha")

        content = base64.b64encode(diagram["current_xml"].encode()).decode()
        payload = {
            "message": f"Update {diagram['name']} v{diagram.get('current_version', 1)}",
            "content": content,
            "branch": branch,
        }
        if sha:
            payload["sha"] = sha

        resp = await client.put(
            f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}",
            headers=headers,
            json=payload
        )

        if resp.status_code not in (200, 201):
            logger.error(
                "Git push failed (legacy): user=%s repo=%s/%s file=%s — GitHub API returned %s: %s",
                user.email, owner, repo_name, file_path, resp.status_code, resp.text[:200]
            )
            raise HTTPException(status_code=resp.status_code, detail=f"GitHub error: {resp.text}")

    await db.git_repos.update_one(
        {"id": repo_id},
        {"$set": {"last_sync": datetime.now(timezone.utc).isoformat(), "diagram_id": diagram_id}}
    )

    logger.info("Git push done (legacy): user=%s repo=%s/%s file=%s", user.email, owner, repo_name, file_path)
    return {"message": "Pushed to GitHub", "file_path": file_path, "branch": branch}


@router.post("/git-repos/{repo_id}/pull")
async def git_pull(repo_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    repo = await db.git_repos.find_one({"id": repo_id}, {"_id": 0})
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    body = {}
    try:
        body = await request.json()
    except:
        pass
    diagram_id = body.get("diagram_id", repo.get("diagram_id"))
    file_path = body.get("file_path")
    
    if not diagram_id:
        raise HTTPException(status_code=400, detail="No diagram specified")
    
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    owner, repo_name = _parse_github_url(repo["repository_url"])
    token = await _resolve_pat(user.email, repo)
    branch = repo.get("default_branch", "main")

    logger.info("Git pull (legacy): user=%s repo=%s/%s diagram=%s", user.email, owner, repo_name, diagram["name"])

    if not file_path:
        sync_path = repo.get("sync_path", "bpmn/")
        file_name = diagram["name"].replace(" ", "_").replace("/", "-") + ".bpmn"
        file_path = f"{sync_path}{file_name}"

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}?ref={branch}",
            headers=headers
        )
        if resp.status_code != 200:
            logger.error(
                "Git pull failed (legacy): user=%s repo=%s/%s file=%s — GitHub API returned %s",
                user.email, owner, repo_name, file_path, resp.status_code
            )
            raise HTTPException(status_code=404, detail=f"File not found in repo: {file_path}")

        content = base64.b64decode(resp.json()["content"]).decode()

    new_version = diagram["current_version"] + 1
    await db.versions.insert_one({
        "id": str(uuid.uuid4()),
        "diagram_id": diagram_id,
        "version_number": new_version,
        "xml_content": content,
        "commit_message": f"Pulled from GitHub ({branch})",
        "parent_version": diagram["current_version"],
        "tags": ["git-pull"],
        "created_by": user.email,
        "created_at": datetime.now(timezone.utc),
    })

    await db.diagrams.update_one(
        {"id": diagram_id},
        {"$set": {
            "current_xml": content,
            "current_version": new_version,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    await db.git_repos.update_one(
        {"id": repo_id},
        {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
    )

    logger.info("Git pull done (legacy): user=%s repo=%s/%s file=%s new_version=%s", user.email, owner, repo_name, file_path, new_version)
    return {"message": "Pulled from GitHub", "new_version": new_version}


@router.get("/git-repos/{repo_id}/files")
async def git_list_files(repo_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    repo = await db.git_repos.find_one({"id": repo_id}, {"_id": 0})
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    owner, repo_name = _parse_github_url(repo["repository_url"])
    token = await _resolve_pat(user.email, repo)
    sync_path = repo.get("sync_path", "bpmn/")
    branch = repo.get("default_branch", "main")

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/contents/{sync_path}?ref={branch}",
            headers=headers
        )
        if resp.status_code != 200:
            return []

        files = [{"name": f["name"], "path": f["path"], "size": f["size"]}
                 for f in resp.json() if isinstance(f, dict) and f.get("name", "").endswith(".bpmn")]

    return files



@router.get("/git-repos/{repo_id}/commits")
async def git_commits(repo_id: str, request: Request):
    """Get recent commits from a GitHub repo."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    repo = await db.git_repos.find_one({"id": repo_id}, {"_id": 0})
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    owner, repo_name = _parse_github_url(repo["repository_url"])
    token = await _resolve_pat(user.email, repo)
    branch = repo.get("default_branch", "main")
    sync_path = repo.get("sync_path", "bpmn/")

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/commits?sha={branch}&path={sync_path}&per_page=20",
            headers=headers
        )
        if resp.status_code != 200:
            return []

        commits = []
        for c in resp.json():
            commits.append({
                "sha": c["sha"][:7],
                "message": c["commit"]["message"],
                "author": c["commit"]["author"]["name"],
                "date": c["commit"]["author"]["date"],
                "url": c["html_url"],
            })

    return commits
