# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

# Pydantic models for the BPMN Modeler API
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    last_name: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    document: Optional[str] = None
    picture: Optional[str] = None
    role: str = "subscription"  # "free", "subscription", "admin"
    plan: Optional[str] = None  # "free" | "pro" | "team" | "enterprise" (optional, set by billing)
    noticias: bool = False  # recibe noticias de IA por email
    github_login: Optional[str] = None
    github_access_token: Optional[str] = None
    github_connected_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BpmnDiagram(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    current_xml: str
    current_version: int = 1
    tags: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BpmnDiagramCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    current_xml: str
    tags: List[str] = []


class BpmnDiagramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_xml: Optional[str] = None
    tags: Optional[List[str]] = None


class BpmnVersion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    diagram_id: str
    version_number: int
    xml_content: str
    commit_message: Optional[str] = ""
    validation_status: str = "valid"
    validation_errors: List[str] = []
    tags: List[str] = []
    annotations: Optional[str] = ""
    parent_version: Optional[int] = None
    changed_elements: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BpmnVersionCreate(BaseModel):
    commit_message: Optional[str] = ""
    tags: List[str] = []
    annotations: Optional[str] = ""
    changed_elements: List[str] = []


class OOPProperty(BaseModel):
    name: str
    type: str
    description: Optional[str] = ""
    required: bool = False
    default_value: Optional[str] = None
    referenceClass: Optional[str] = None
    arrayItemType: Optional[str] = None
    arrayItemClass: Optional[str] = None
    nested_properties: Optional[List["OOPProperty"]] = None
    validations: Optional[Dict[str, str]] = None
    enum_values: Optional[List[str]] = None


class OOPClass(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    properties: List[OOPProperty] = []
    category: str = "other"
    tags: List[str] = []
    parent_class: Optional[str] = None
    interfaces: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OOPClassCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    properties: List[OOPProperty] = []
    category: str = "other"
    tags: List[str] = []
    parent_class: Optional[str] = None
    interfaces: List[str] = []


class OOPClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    properties: Optional[List[OOPProperty]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    parent_class: Optional[str] = None
    interfaces: Optional[List[str]] = None


class OOPClassVersion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    class_id: str
    class_name: str
    version_number: int
    description: Optional[str] = ""
    properties: List[OOPProperty] = []
    category: str = "other"
    tags: List[str] = []
    commit_message: Optional[str] = ""
    changes_summary: Dict[str, List[str]] = {"added": [], "removed": [], "modified": []}
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Branch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    diagram_id: str
    name: str
    description: Optional[str] = ""
    base_version: int
    current_xml: str
    current_version: int = 1
    is_merged: bool = False
    merged_version: Optional[int] = None
    status: str = "active"
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BranchCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    diagram_id: str
    element_id: str
    element_name: str
    content: str
    mentions: List[str] = []
    parent_comment_id: Optional[str] = None
    is_resolved: bool = False
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CommentCreate(BaseModel):
    element_id: str
    element_name: str
    content: str
    mentions: List[str] = []
    parent_comment_id: Optional[str] = None


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_email: str
    type: str
    message: str
    from_user: str
    diagram_id: Optional[str] = None
    diagram_name: Optional[str] = None
    comment_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    diagram_id: str
    diagram_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BpmnComponent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    xml_fragment: str
    description: Optional[str] = ""
    category: str = "other"
    preview_image: Optional[str] = None
    tags: List[str] = []
    is_public: bool = True
    usage_count: int = 0
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BpmnComponentCreate(BaseModel):
    name: str
    xml_fragment: str
    description: Optional[str] = ""
    category: str = "other"
    tags: List[str] = []
    is_public: bool = True


class GitRepository(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    provider: str
    repository_url: str
    access_token: str
    default_branch: str = "main"
    current_branch: Optional[str] = None
    last_sync: Optional[datetime] = None
    sync_path: str = "bpmn/"
    auto_sync: bool = False
    diagram_id: Optional[str] = None
    project_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GitRepositoryCreate(BaseModel):
    name: str
    provider: str
    repository_url: str
    access_token: str = ""
    default_branch: str = "main"
    sync_path: str = "bpmn/"
    auto_sync: bool = False
    diagram_id: Optional[str] = None
    project_id: Optional[str] = None


class AIGenerateRequest(BaseModel):
    prompt: str
    context: Optional[str] = None


class CodeAnalyzeRequest(BaseModel):
    code: str
    language: str = "python"


class GeneratePromptRequest(BaseModel):
    diagram_ids: List[str] = []
    code_type: str = "api"
    language: str = "python"
    custom_instructions: Optional[str] = None


class GenerateCodeRequest(BaseModel):
    prompt: str
    code_type: str = "api"
    language: str = "python"


class GenerateSummaryRequest(BaseModel):
    include_xml: bool = True
    include_oop: bool = True
    custom_context: Optional[str] = None


class ProcessPromptRequest(BaseModel):
    prompt: str
    llm_provider: str = "deepseek"  # "deepseek", "deepseek-flash", "minimax", "mimo", "opencode", "opencode-go"
    output_type: str = "code"  # "code" or "docs"
    language: str = "python"  # for code: python, nodejs, java, csharp, go, sudolang
    model: Optional[str] = None  # specific model override (e.g. for OpenCode providers)


class RewriteContentRequest(BaseModel):
    content: str
    system_prompt: str


PROJECT_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#DB2777", "#4F46E5", "#0891B2"]
PROJECT_ICONS = ["folder", "briefcase", "building", "rocket", "zap", "target", "globe", "layers"]


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    color: str = "#7C3AED"
    icon: str = "folder"
    tags: List[str] = []
    diagram_ids: List[str] = []
    github_repo_url: Optional[str] = None
    github_default_branch: str = "main"
    github_sync_path: str = "bpmn/"
    github_last_sync: Optional[datetime] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    active_version_ids: List[str] = []
    baseline_id: Optional[str] = None
    active_branch_id: Optional[str] = None
    default_branch_id: Optional[str] = None


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: str = "#7C3AED"
    icon: str = "folder"
    tags: List[str] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    tags: Optional[List[str]] = None
    github_repo_url: Optional[str] = None
    github_default_branch: Optional[str] = None
    github_sync_path: Optional[str] = None


# ---- Project Files (user-managed file/folder tree) ----

class ProjectFileNode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    parent_id: Optional[str] = None
    type: str  # "file" | "directory"
    name: str
    content: Optional[str] = ""
    template: Optional[str] = None
    branch_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProjectFileCreate(BaseModel):
    parent_id: Optional[str] = None
    parent_path: Optional[str] = None
    type: str  # "file" | "directory"
    name: str
    content: Optional[str] = ""
    template: Optional[str] = None


class ProjectFileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    parent_id: Optional[str] = None


# ---- Project Versioning (git-like branches) ----

class ProjectBranch(BaseModel):
    """A named branch within a project, like a git branch.

    Each branch stores full resource membership (file IDs, diagram IDs, spec IDs)
    rather than incremental deltas. Creating a branch from a parent deep-copies
    project_files and reference-copies diagrams/specs from the parent.
    """
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    parent_branch_id: Optional[str] = None
    description: Optional[str] = ""
    file_ids: List[str] = []
    diagram_ids: List[str] = []
    spec_ids: List[str] = []
    code_snapshot_ids: List[str] = []
    impact_summary: dict = {
        "files_count": 0,
        "diagrams_count": 0,
        "specs_count": 0,
        "code_count": 0,
    }
    is_default: bool = False
    status: str = "active"
    merged_into: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---- Merge request model ----

class MergeExecuteRequest(BaseModel):
    resolved_files: List[dict] = []
    commit_message: Optional[str] = ""


# DEPRECATED — kept for migration compatibility.
# These models are no longer used for new operations.

class ProjectBaseline(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    version_number: int = 0
    label: str = "Baseline (auto)"
    files_snapshot: List[dict] = []
    diagram_states: List[dict] = []
    spec_states: List[dict] = []
    code_states: List[dict] = []
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProjectVersion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    baseline_id: str
    version_number: int
    label: Optional[str] = ""
    commit_message: Optional[str] = ""
    file_changes: List[dict] = []
    diagram_version_ids: List[str] = []
    spec_snapshot_ids: List[str] = []
    code_snapshot_ids: List[str] = []
    impact_summary: dict = {
        "files_added": 0, "files_modified": 0, "files_deleted": 0,
        "diagrams_changed": 0, "specs_changed": 0, "code_changed": 0,
    }
    parent_version_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---- Branch request / response models ----

class CreateBranchRequest(BaseModel):
    name: str
    parent_branch_id: Optional[str] = None
    description: Optional[str] = ""
    commit_message: Optional[str] = ""


class SwitchBranchRequest(BaseModel):
    branch_id: str


class BranchStateResponse(BaseModel):
    active_branch_id: Optional[str] = None
    active_branch_name: Optional[str] = None
    default_branch_id: Optional[str] = None
    branch_count: int = 0
    branches: List[dict] = []


# DEPRECATED — kept for migration compatibility.
class CreateProjectVersionRequest(BaseModel):
    label: Optional[str] = None
    commit_message: Optional[str] = None


class ToggleVersionRequest(BaseModel):
    active: bool


class ProjectStateResponse(BaseModel):
    baseline_id: Optional[str] = None
    active_version_ids: List[str] = []
    active_version_count: int = 0
    total_version_count: int = 0
    versions: List[dict] = []
