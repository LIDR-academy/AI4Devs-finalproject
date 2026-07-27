// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUpgradeModal } from "@/contexts/UpgradeModalContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { downloadText, downloadJson, downloadBlob, downloadFromUrl } from "@/lib/downloadFile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Workflow,
  Plus,
  Search,
  ArrowLeft,
  FileCode,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  FolderKanban,
  Clock,
  Folder,
  Briefcase,
  Building2,
  Rocket,
  Zap,
  Target,
  Globe,
  Layers,
  LayoutDashboard,
  Library,
  Code2,
  Puzzle,
  LogOut,
  Settings,
  LinkIcon,
  Unlink,
  GitBranch,
  Loader2,
  Sparkles,
  Copy,
  Download,
  Upload,
  Check,
  Terminal,
  Cpu,
  Wand2,
  FileText,
  X,
  Github,
  ArrowUpRight,
  History,
  Lightbulb,
  FileArchive,
  FileJson,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import BranchBadge from "@/components/BranchBadge";
import { suggestDeepseekVariant, NUDGE_COPY } from "@/lib/deepseekHeuristic";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLimits } from "@/hooks/useLimits";
import { useLlmModels, formatProviderCost } from "@/hooks/useLlmModels";
import { UpgradeModal } from "@/components/UpgradeModal";
import FreePlanBanner from "@/components/FreePlanBanner";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ProjectTree from "@/components/ProjectTree";
import FilePreviewPanel from "@/components/FilePreviewPanel";
import AiLoadingOverlay from "@/components/AiLoadingOverlay";
import MarkdownEditor from "@/components/MarkdownEditor";
import ComponentOverview from "@/components/ComponentOverview";
import GitHubStatusBar from "@/components/GitHubStatusBar";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";

const ICON_MAP = {
  folder: Folder,
  briefcase: Briefcase,
  building: Building2,
  rocket: Rocket,
  zap: Zap,
  target: Target,
  globe: Globe,
  layers: Layers,
};

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuth();
  const { t } = useI18n();
  const { checkLimit, upgradeOpen, upgradeInfo, closeUpgrade } = useLimits();
  const { providers: llmProviders } = useLlmModels();
  const { handleResponse: handleUpgradeResponse } = useUpgradeModal();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addDiagramOpen, setAddDiagramOpen] = useState(false);
  const [allDiagrams, setAllDiagrams] = useState([]);
  const [diagSearch, setDiagSearch] = useState("");
  const [removeDiagram, setRemoveDiagram] = useState(null);
  const [loadingDiagrams, setLoadingDiagrams] = useState(false);

  // Summary/Prompt Generation State
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryStep, setSummaryStep] = useState("config"); // config, prompt, result
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [summaryContext, setSummaryContext] = useState("");
  const [summaryIncludeXml, setSummaryIncludeXml] = useState(true);
  const [summaryIncludeOop, setSummaryIncludeOop] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);
  // LLM Processing State
  const [llmProvider, setLlmProvider] = useState("deepseek");
  const [deepseekVariant, setDeepseekVariant] = useState("pro"); // "pro" | "flash"
  const [llmOutputType, setLlmOutputType] = useState("code");
  const [llmLanguage, setLlmLanguage] = useState("sudolang");
  const [llmResult, setLlmResult] = useState("");
  const [processingLlm, setProcessingLlm] = useState(false);
  const [copiedLlmResult, setCopiedLlmResult] = useState(false);

  // Code Generation State
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [codeGenStep, setCodeGenStep] = useState("config"); // config, prompt, code
  const [selectedDiagramIds, setSelectedDiagramIds] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [codeType, setCodeType] = useState("api");
  const [codeLang, setCodeLang] = useState("sudolang");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Git repos state
  const [gitRepos, setGitRepos] = useState([]);
  const [gitCommits, setGitCommits] = useState({});
  // GitHub project linking state
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [linkRepoUrl, setLinkRepoUrl] = useState("");
  const [linkBranch, setLinkBranch] = useState("main");
  const [linkSyncPath, setLinkSyncPath] = useState("bpmn/");
  const [linkGithubLogin, setLinkGithubLogin] = useState("");
  const [linkGithubToken, setLinkGithubToken] = useState("");
  const [linkRepoPrivate, setLinkRepoPrivate] = useState(true);
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [pushingAll, setPushingAll] = useState(false);
  const [pullingAll, setPullingAll] = useState(false);
  const [gitHubResult, setGitHubResult] = useState(null);
  const [gitHubTree, setGitHubTree] = useState(null);
  const [gitHubTreeLoading, setGitHubTreeLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [showFiles, setShowFiles] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimer = useRef(null);
  const pushTimer = useRef(null);
  const [aiRewriteLoading, setAiRewriteLoading] = useState(false);
  const [deleteFileTarget, setDeleteFileTarget] = useState(null);
  const [pushingToGithub, setPushingToGithub] = useState(false);
  const [treeRefreshKey, setTreeRefreshKey] = useState(0);

  const AI_REWRITE_PROMPT =
    "Actúa como un experto en diseño de productos digitales y desarrollo de aplicaciones. " +
    "A partir de la siguiente pequeña descripción que te doy, genera un texto completo y detallado " +
    "que describa cómo sería la aplicación, especificando todos los apartados (pantallas, secciones " +
    "o módulos) que la compondrían. Para cada apartado, incluye una pequeña descripción de su función " +
    "y qué contenido o acciones principales tendría.\n\n" +
    "IMPORTANTE: Detecta automáticamente el idioma en el que está escrita la descripción del usuario " +
    "(la que aparece entre comillas más abajo). Toda tu respuesta (nombre sugerido, resumen y lista " +
    "de apartados) debe generarse en ESE MISMO IDIOMA. Si la descripción está en español, respondes " +
    "en español; si está en inglés, en inglés; si está en francés, alemán, italiano, portugués, etc., " +
    "respondes en ese idioma.\n\n" +
    "La descripción de mi idea es:\n" +
    '"[CONTENIDO]"\n\n' +
    "Por favor, estructura tu respuesta de la siguiente manera:\n\n" +
    "- **Nombre sugerido para la app** (opcional pero recomendado)\n" +
    "- **Resumen general de la aplicación** (2 o 3 frases)\n" +
    "- **Lista de apartados** (cada apartado con un título y una breve descripción de qué se hace en él)\n\n" +
    "Asegúrate de que los apartados cubran desde la pantalla de inicio hasta las funciones clave, " +
    "pasando si es necesario por perfiles de usuario, configuración, notificaciones, etc. " +
    "Sé claro y práctico.";

  const AI_REWRITE_PROMPTS = [
    {
      label: "Descripción de app",
      description: "Genera una descripción detallada de la aplicación a partir de una idea breve",
      systemPrompt: AI_REWRITE_PROMPT,
    },
    {
      label: "Mejorar redacción",
      description: "Reescribe el contenido con mejor estilo, claridad y estructura",
      systemPrompt:
        "Actúa como un editor profesional. A continuación te doy un texto. Reescríbelo mejorando " +
        "la redacción, la claridad, la estructura y el estilo, pero manteniendo el mismo significado, " +
        "idioma y tono general. Corrige cualquier error ortográfico o gramatical. " +
        "No añadas información nueva ni elimines contenido importante.\n\n" +
        "El texto es:\n" +
        '"[CONTENIDO]"',
    },
  ];

  const handleAIRewriteMd = async (promptDef) => {
    if (!selectedFile || !projectId || aiRewriteLoading) return;
    const content = editContent || selectedFile.content || "";
    if (!content.trim()) {
      toast.error("El archivo está vacío");
      return;
    }
    const systemPrompt = (promptDef?.systemPrompt || AI_REWRITE_PROMPT).replace("[CONTENIDO]", content);
    const parentPath = selectedFile.path?.includes("/")
      ? selectedFile.path.substring(0, selectedFile.path.lastIndexOf("/"))
      : null;

    setAiRewriteLoading(true);
    try {
      // Step 1: call AI
      const aiRes = await fetch(`${API}/ai/rewrite-content`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, system_prompt: systemPrompt }),
      });
      if (!aiRes.ok) {
        const errData = await aiRes.json().catch(() => ({}));
        throw new Error(errData.detail || "Error al llamar a la IA");
      }
      const aiData = await aiRes.json();

      // Step 2: save main file
      let saveOk = false;
      if (selectedFile.id) {
        // Auto-save already created the project_file record
        const putRes = await fetch(`${API}/projects/${projectId}/files/${selectedFile.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ content: aiData.content }),
        });
        saveOk = putRes.ok;
      }
      if (!saveOk) {
        // Fallback: find by name or create
        const filesRes = await fetch(`${API}/projects/${projectId}/files`, { headers: getAuthHeaders() });
        let fileId = null;
        if (filesRes.ok) {
          const projectFiles = await filesRes.json();
          const match = projectFiles.find((f) => f.name === selectedFile.name && f.type === "file");
          fileId = match?.id;
        }
        if (fileId) {
          const putRes = await fetch(`${API}/projects/${projectId}/files/${fileId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ content: aiData.content }),
          });
          saveOk = putRes.ok;
        } else {
          const createBody = { type: "file", name: selectedFile.name, content: aiData.content };
          if (parentPath) createBody.parent_path = parentPath;
          const postRes = await fetch(`${API}/projects/${projectId}/files`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(createBody),
          });
          saveOk = postRes.ok;
          if (postRes.ok) {
            const created = await postRes.json();
            setSelectedFile((prev) => prev ? { ...prev, id: created.id } : prev);
          }
        }
      }

      if (!saveOk) throw new Error("No se pudo guardar el archivo");

      toast.success("Contenido reescrito con IA");
      setEditContent(aiData.content);
      setSelectedFile((prev) => prev ? { ...prev, content: aiData.content } : prev);

      // Step 3: parse apartados and create .md files
      // Detect the "apartados" section heading — handles both markdown
      // headings (## / ###) and bold text (**Title**) formats.
      const APARTADOS_RE = new RegExp(
        "(?:#{2,4}\\s+|[*_]{2})" +                // ## or ### or **
        "[^#*\n]*?" +                              // optional leading text
        "(?:[Aa]partados?|[Pp]antallas?\\s*(?:y|e|\\/)\\s*[Mm]ódulos?|[Mm]ódulos?\\s*(?:y|e|\\/)\\s*[Pp]antallas?|[Ss]ecciones?|[Ss]ections?|[Mm]ódulos?|[Mm]odules?|[Ff]uncionalidades?|[Ff]eatures?|[Cc]omponents?|[Pp]antallas?|[Ss]creens?)" +
        "[^#*\n]*?" +                              // optional trailing text
        "(?:[*_]{2})?" +                           // optional closing **
        "\\s*:?\\s*\n", "i"
      );
      const apartadosHeading = aiData.content.match(APARTADOS_RE);
      let apartadosSection = aiData.content;
      if (apartadosHeading) {
        const idx = aiData.content.indexOf(apartadosHeading[0]) + apartadosHeading[0].length;
        apartadosSection = aiData.content.substring(idx);

        // Stop at the next top-level section (## or # heading)
        const nextSection = apartadosSection.search(/\n#{1,2}\s+[^#]/);
        if (nextSection !== -1) apartadosSection = apartadosSection.substring(0, nextSection);
      }

      const createdFiles = [];

      // Strategy A: split by headings (## / ### / ####) — only if apartados heading found
      if (apartadosHeading) {
        const headingBlocks = apartadosSection.split(/\n(?=#{2,4}\s+)/);
        if (headingBlocks.length > 1) {
          for (const block of headingBlocks) {
            const hMatch = block.match(/^#{2,4}\s+(.+?)\s*\n/);
            if (!hMatch) continue;
            const title = hMatch[1].trim();
            const body = block.substring(hMatch[0].length).trim();
            if (!title || !body) continue;
            const clean = title.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-_]/g, "").trim();
            if (!clean) continue;
            try {
              const createBody = { type: "file", name: clean + ".md", content: body };
              if (parentPath) createBody.parent_path = parentPath;
              const cRes = await fetch(`${API}/projects/${projectId}/files`, {
                method: "POST", headers: getAuthHeaders(), body: JSON.stringify(createBody),
              });
              if (cRes.ok) createdFiles.push(clean + ".md");
            } catch (ce) { console.error("AI Rewrite: error creating file (A):", ce); }
          }
        }
      }

        // Strategy B: if no heading blocks found, try bold-title patterns
        if (createdFiles.length === 0) {
          // Match lines like "- **Title**: body" or "- **Title:** body" or "**Title**: body"
          const boldLineRe = /^(?:\s*[-*]\s+)?[*_]{2}(.+?)[*_]{2}\s*:?\s*(.+)$/gm;
          let m;
          while ((m = boldLineRe.exec(apartadosSection)) !== null) {
            const title = m[1].trim();
            const body = m[2].trim();
            if (!title || !body) continue;
            const clean = title.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-_]/g, "").trim();
            if (!clean) continue;
            try {
              const createBody = { type: "file", name: clean + ".md", content: body };
              if (parentPath) createBody.parent_path = parentPath;
              const cRes = await fetch(`${API}/projects/${projectId}/files`, {
                method: "POST", headers: getAuthHeaders(), body: JSON.stringify(createBody),
              });
              if (cRes.ok) createdFiles.push(clean + ".md");
            } catch (ce) { console.error("AI Rewrite: error creating file (B):", ce); }
          }
        }

        // Strategy C: numbered/bullet bold titles followed by paragraph(s)
        if (createdFiles.length === 0) {
          // Parse lines like "1. **Title**" or "- **Title**" or "**Title**"
          // followed by multiline description until next bold title or empty line
          var lines = apartadosSection.split("\n");
          var currentTitle = null;
          var currentBody = [];
          var boldTitlePattern = /^(?:\s*(?:\d+\.\s*)?(?:\s*[-*]\s+)?)\*\*(.+?)\*\*\s*$/;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var tMatch = line.match(boldTitlePattern);
            if (tMatch) {
              // Save previous block
              if (currentTitle && currentBody.length > 0) {
                var cBody = currentBody.join("\n").trim();
                if (cBody) {
                  try {
                    var cBody2 = { type: "file", name: currentTitle + ".md", content: cBody };
                    if (parentPath) cBody2.parent_path = parentPath;
                    var cRes2 = await fetch(API + "/projects/" + projectId + "/files", {
                      method: "POST", headers: getAuthHeaders(), body: JSON.stringify(cBody2),
                    });
                    if (cRes2.ok) createdFiles.push(currentTitle + ".md");
                  } catch (ce) { console.error("AI Rewrite: error creating file (C):", ce); }
                }
              }
              // Start new block
              var rawTitle = tMatch[1].trim();
              currentTitle = rawTitle.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-_]/g, "").trim();
              currentBody = [];
            } else if (currentTitle) {
              currentBody.push(line);
            }
          }
          // Save last block
          if (currentTitle && currentBody.length > 0) {
            var cBody3 = currentBody.join("\n").trim();
            if (cBody3) {
              try {
                var cBody4 = { type: "file", name: currentTitle + ".md", content: cBody3 };
                if (parentPath) cBody4.parent_path = parentPath;
                var cRes3 = await fetch(API + "/projects/" + projectId + "/files", {
                  method: "POST", headers: getAuthHeaders(), body: JSON.stringify(cBody4),
                });
                if (cRes3.ok) createdFiles.push(currentTitle + ".md");
              } catch (ce) { console.error("AI Rewrite: error creating file (C2):", ce); }
            }
          }
        }

        if (createdFiles.length > 0) {
          toast.success(`${createdFiles.length} apartado(s) creado(s): ${createdFiles.join(", ")}`);
        } else {
          toast.info("No se detectaron apartados con formato reconocible en la respuesta de la IA.", { duration: 6000 });
        }

      // Refresh tree
      setGitHubTree(null);
    } catch (err) {
      toast.error(err.message || "Error al reescribir contenido");
    } finally {
      setAiRewriteLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchGitRepos();
    fetchSpecsCount();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fetch tree: on repo link, on tree clear (after create/delete), or on project load
  useEffect(() => {
    if (!gitHubTree && !gitHubTreeLoading && projectId) {
      fetchGitHubTree();
    }
  }, [gitHubTree, gitHubTreeLoading, projectId, project?.github_repo_url]);

  // Project-level requirements bootstrap state
  const [specsCount, setSpecsCount] = useState(null); // null = unknown, 0 = empty
  const [aiReqOpen, setAiReqOpen] = useState(false);
  const [aiReqBrief, setAiReqBrief] = useState("");
  const [aiReqModel, setAiReqModel] = useState("deepseek-pro");
  const [aiReqLoading, setAiReqLoading] = useState(false);
  const [aiReqResult, setAiReqResult] = useState(null);
  // .md file selector for the AI requirements dialog
  const [descripcionFiles, setDescripcionFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [descFilesLoading, setDescFilesLoading] = useState(false);
  const [descFilesOpen, setDescFilesOpen] = useState(false);

  // Fetch .md files from descripcion folder when dialog opens
  useEffect(() => {
    if (!aiReqOpen || !projectId) return;
    setDescFilesLoading(true);
    setDescFilesOpen(false);
    setSelectedFileIds(new Set());
    fetch(`${API}/projects/${projectId}/descripcion-md-files`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((files) => {
        setDescripcionFiles(Array.isArray(files) ? files : []);
        setDescFilesLoading(false);
      })
      .catch(() => {
        setDescripcionFiles([]);
        setDescFilesLoading(false);
      });
  }, [aiReqOpen, projectId]);

  const handleToggleFile = (fileId) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleSelectAllFiles = () => {
    if (selectedFileIds.size === descripcionFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(descripcionFiles.map((f) => f.id)));
    }
  };

  const handleUseSelectedFiles = () => {
    const selected = descripcionFiles.filter((f) => selectedFileIds.has(f.id));
    if (selected.length === 0) return;
    const combined = selected
      .map((f) => `## ${f.name}\n\n${f.content || ""}`)
      .join("\n\n---\n\n");
    setAiReqBrief(combined);
    setDescFilesOpen(false);
  };

  const fetchSpecsCount = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/specs/specifications?project_id=${projectId}`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) {
        const list = await res.json();
        setSpecsCount(Array.isArray(list) ? list.length : 0);
      }
    } catch {
      // silent — banner just won't show
    }
  }, [projectId]);

  const handleGenerateAiRequirements = async () => {
    const brief = aiReqBrief.trim();
    if (brief.length < 30) {
      toast.error("La descripcion debe tener al menos 30 caracteres");
      return;
    }
    setAiReqLoading(true);
    setAiReqResult(null);
    try {
      const res = await fetch(
        `${API}/ai-projects/${projectId}/generate-requirements`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ brief, model: aiReqModel, target_count: 10 }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setAiReqResult(data);
        toast.success(`✨ ${data.requirements_created} requirements generados`);
        fetchSpecsCount();
        setAiReqOpen(false);
        setAiReqBrief("");
        setAiReqResult(null);
        // Take the user straight to the spec to review
        if (data.spec_id) navigate(`/specs/${data.spec_id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al generar requirements");
      }
    } catch {
      toast.error("Error al generar requirements");
    } finally {
      setAiReqLoading(false);
    }
  };

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        setProject(await res.json());
      } else {
        toast.error(t("proj.not_found"));
        navigate("/projects");
      }
    } catch (err) {
      toast.error(t("proj.load_error"));
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGitRepos = async () => {
    try {
      const res = await fetch(`${API}/git-repos`, { headers: getAuthHeaders() });
      if (res.ok) {
        const repos = await res.json();
        setGitRepos(repos);
        // Fetch commits for each repo
        for (const repo of repos) {
          try {
            const commitRes = await fetch(`${API}/git-repos/${repo.id}/commits`, { headers: getAuthHeaders() });
            if (commitRes.ok) {
              const commits = await commitRes.json();
              setGitCommits(prev => ({ ...prev, [repo.id]: commits }));
            }
          } catch (_err) { /* silent */ }
        }
      }
    } catch (_err) { /* silent */ }
  };

  const handleLinkGitHub = async () => {
    if (!linkRepoUrl.trim()) return;
    setLinkingInProgress(true);
    try {
      const body = {
        repo_url: linkRepoUrl.trim(),
        branch: linkBranch,
        sync_path: linkSyncPath,
        repo_private: linkRepoPrivate,
      };
      if (linkGithubLogin.trim() && linkGithubToken.trim()) {
        body.github_login = linkGithubLogin.trim();
        body.github_access_token = linkGithubToken.trim();
      }
      const res = await fetch(`${API}/projects/${projectId}/github-link`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.github_login && setUser) {
          setUser(prev => ({ ...prev, github_login: data.github_login }));
        }
        if (data.created) {
          toast.success("Repositorio creado y vinculado al proyecto");
        } else {
          toast.success("Repositorio vinculado al proyecto");
        }
        setShowGitHubModal(false);
        setLinkGithubLogin("");
        setLinkGithubToken("");
        setLinkRepoPrivate(true);
        fetchProject();
        setGitHubTree(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "No se pudo vincular el repositorio");
      }
    } catch {
      toast.error("Error al vincular repositorio");
    } finally {
      setLinkingInProgress(false);
    }
  };

  const handleUnlinkGitHub = async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/github-link`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast.success("Repositorio desvinculado");
        fetchProject();
      }
    } catch {
      toast.error("Error al desvincular");
    }
  };

  const handlePushAll = async () => {
    setPushingAll(true);
    setGitHubResult(null);
    try {
      const res = await fetch(`${API}/projects/${projectId}/github-push`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setGitHubResult(data);
        toast.success(data.message);
        fetchProject();
        fetchGitHubTree(); // refresh tree after push
      } else {
        toast.error(data.detail || "Error en push");
      }
    } catch {
      toast.error("Error al hacer push");
    } finally {
      setPushingAll(false);
    }
  };

  const handlePullAll = async () => {
    setPullingAll(true);
    setGitHubResult(null);
    try {
      const res = await fetch(`${API}/projects/${projectId}/github-pull`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setGitHubResult(data);
        toast.success(data.message);
        fetchAllDiagrams();
        fetchProject();
        fetchGitHubTree(); // refresh tree after pull
      } else {
        toast.error(data.detail || "Error en pull");
      }
    } catch {
      toast.error("Error al hacer pull");
    } finally {
      setPullingAll(false);
    }
  };

  const fetchGitHubTree = async () => {
    setGitHubTreeLoading(true);
    try {
      const headers = getAuthHeaders();
      const [treeRes, filesRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}/github-tree`, { headers }),
        fetch(`${API}/projects/${projectId}/files`, { headers }),
      ]);
      if (treeRes.ok) {
        const data = await treeRes.json();
        // Merge project_files into the tree
        if (filesRes.ok) {
          const projectFiles = await filesRes.json();
          if (projectFiles.length > 0) {
            // Index project files by parent_id for fast lookup
            const pfByParentId = {};
            for (const pf of projectFiles) {
              const key = pf.parent_id || "__root__";
              (pfByParentId[key] = pfByParentId[key] || []).push(pf);
            }
            // Recursively inject project files into the existing GitHub tree.
            // When a project directory matches a GitHub directory by name,
            // we merge them (set _projectFileId) instead of creating a duplicate.
            const injectProjectFiles = (node, parentId) => {
              const key = parentId || "__root__";
              const pfs = pfByParentId[key] || [];
              if (pfs.length === 0) return;
              const children = node.children || [];
              for (const pf of pfs) {
                const existing = children.find(
                  (c) => c.name === pf.name && c.type === pf.type
                );
                if (existing) {
                  // Match found -> tag it with _projectFileId
                  existing._projectFileId = pf.id;
                  if (pf.type === "directory") {
                    injectProjectFiles(existing, pf.id);
                  }
                } else {
                  // New project-only file/folder
                  const child = {
                    name: pf.name,
                    type: pf.type,
                    _projectFileId: pf.id,
                    children: [],
                  };
                  if (pf.type === "directory") injectProjectFiles(child, pf.id);
                  children.push(child);
                }
              }
              node.children = children;
            };
            // Inject into the files/ wrapper (backend wraps project_files here
            // to avoid clashes with phase-snapshot dirs like code/, bpmn/)
            const filesDir = (data.tree.children || []).find(
              (c) => c.name === "files" && c.type === "directory"
            );
            if (filesDir) {
              injectProjectFiles(filesDir, null);
            } else {
              // Fallback: inject at root (shouldn't normally happen)
              injectProjectFiles(data.tree, null);
            }
          }
        }
        setGitHubTree(data);
      } else if (filesRes.ok) {
        // No github tree but we have project_files
        const projectFiles = await filesRes.json();
        const buildTree = (flatList, parentId) =>
          flatList
            .filter((f) => (f.parent_id || null) === (parentId || null))
            .map((f) => ({
              name: f.name,
              type: f.type,
              children: f.type === "directory" ? buildTree(flatList, f.id) : [],
              _projectFileId: f.id,
            }));
        setGitHubTree({
          tree: {
            name: (project?.name || projectId).replace(/\s+/g, "-").toLowerCase(),
            type: "directory",
            children: buildTree(projectFiles, null),
          },
          files: {},
        });
      }
    } catch (err) {
      console.error("Error fetching GitHub tree:", err);
    } finally {
      setGitHubTreeLoading(false);
    }
  };

  // Bridge ProjectTree's onFileSelect to the existing selectedFile state
  const handleProjectTreeFileSelect = async ({ name, path, content, projectId, _projectFileId }) => {
    let fileContent = content || "";
    let fileId = _projectFileId || null;

    // If content is empty (e.g. user-created files), fetch from API
    if (!fileContent && fileId) {
      try {
        const res = await fetch(`${API}/projects/${projectId}/files/${fileId}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const fileData = await res.json();
          fileContent = fileData.content || "";
        }
      } catch { /* fallback to empty */ }
    }
    if (!fileContent && !fileId && projectId) {
      // Fallback: find by name in project_files
      try {
        const res = await fetch(`${API}/projects/${projectId}/files`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const projectFiles = await res.json();
          const match = projectFiles.find((f) => f.name === name && f.type === "file");
          if (match) {
            fileId = match.id;
            fileContent = match.content || "";
          }
        }
      } catch { /* fallback to empty */ }
    }

    setSelectedFile({ name, path, content: fileContent, projectId, id: fileId });
    setSaveStatus(null);
  };

  // Sync editContent when selectedFile changes
  useEffect(() => {
    setEditContent(selectedFile?.content || "");
  }, [selectedFile?.path, selectedFile?.content]);

  // Debounced auto-save
  const triggerSave = useCallback((content) => {
    if (!selectedFile || !projectId) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        // Find or create project file record
        let fileId = selectedFile.id || null;
        if (!fileId) {
          const filesRes = await fetch(`${API}/projects/${projectId}/files`, {
            headers: getAuthHeaders(),
          });
          if (filesRes.ok) {
            const projectFiles = await filesRes.json();
            const match = projectFiles.find(
              (f) => f.name === selectedFile.name && f.type === "file"
            );
            fileId = match?.id;
          }
        }

        if (fileId) {
          await fetch(`${API}/projects/${projectId}/files/${fileId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ content }),
          });
        } else {
          const createRes = await fetch(`${API}/projects/${projectId}/files`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              type: "file",
              name: selectedFile.name,
              content,
            }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            setSelectedFile((prev) => prev ? { ...prev, id: created.id } : prev);
          }
        }
        setSaveStatus("saved");
        setGitHubTree(null); // trigger tree refresh

        // Auto-push to GitHub after save (debounced 30s)
        if (project?.github_repo_url) {
          if (pushTimer.current) clearTimeout(pushTimer.current);
          pushTimer.current = setTimeout(async () => {
            try {
              const pushRes = await fetch(`${API}/projects/${projectId}/github-push`, {
                method: "POST",
                headers: getAuthHeaders(),
              });
              if (pushRes.ok) fetchGitHubTree();
            } catch { /* silencioso — el banner de save status ya muestra el estado */ }
          }, 30000);
        }
      } catch {
        setSaveStatus("error");
      }
    }, 1500);
  }, [selectedFile, projectId, project?.github_repo_url]);

  // Force save on unmount or file close
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      if (pushTimer.current) {
        clearTimeout(pushTimer.current);
        pushTimer.current = null;
      }
    };
  }, []);

  const handleContentChange = (newContent) => {
    setEditContent(newContent);
    setSaveStatus(null);
    triggerSave(newContent);
  };

  const handleDeleteFile = async () => {
    if (!deleteFileTarget?.id || !projectId) return;
    try {
      await fetch(`${API}/projects/${projectId}/files/${deleteFileTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setSelectedFile(null);
      setDeleteFileTarget(null);
      setGitHubTree(null); // trigger tree refresh
      setTreeRefreshKey((k) => k + 1); // force ProjectTree remount
      // Push to GitHub if repo linked
      if (project?.github_repo_url) {
        fetch(`${API}/projects/${projectId}/github-push`, {
          method: "POST",
          headers: getAuthHeaders(),
        }).catch(() => {});
      }
    } catch { /* silent */ }
  };

  const handlePushToGithub = async () => {
    if (!projectId || pushingToGithub) return;
    setPushingToGithub(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/github-push`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchGitHubTree();
        toast.success("GitHub actualizado");
      }
    } catch {
      toast.error("Error al actualizar GitHub");
    } finally {
      setPushingToGithub(false);
    }
  };

  const fetchAllDiagrams = async () => {
    setLoadingDiagrams(true);
    try {
      const res = await fetch(`${API}/diagrams`, { headers: getAuthHeaders() });
      if (res.ok) setAllDiagrams(await res.json());
    } catch (err) {
      console.error("Error fetching diagrams:", err);
    } finally {
      setLoadingDiagrams(false);
    }
  };

  const openAddDialog = () => {
    fetchAllDiagrams();
    setDiagSearch("");
    setAddDiagramOpen(true);
  };

  const addDiagram = async (diagramId) => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/diagrams/${diagramId}`, {
        method: "POST", headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast.success(t("proj.diagram_added"));
        fetchProject();
      } else {
        let parsed = null;
        try { parsed = await res.json(); } catch {}
        const handled = await handleUpgradeResponse({
          status: res.status,
          data: parsed,
          type: "diagrams_per_project",
          message: "Has alcanzado el limite del plan Free (3 diagramas por proyecto). Sube a Pro para diagramas ilimitados.",
          upgrade_url: "/pricing#pro",
        });
        if (!handled) toast.error(t("proj.add_error"));
      }
    } catch (err) {
      toast.error(t("proj.add_error"));
    }
  };

  const handleRemoveDiagram = async () => {
    if (!removeDiagram) return;
    try {
      await fetch(`${API}/projects/${projectId}/diagrams/${removeDiagram.id}`, {
        method: "DELETE", headers: getAuthHeaders(),
      });
      toast.success(t("proj.diagram_removed"));
      setRemoveDiagram(null);
      fetchProject();
    } catch (err) {
      toast.error(t("proj.remove_error"));
    }
  };

  // Code generation functions
  const openCodeGen = () => {
    setCodeGenStep("config");
    setSelectAll(true);
    setSelectedDiagramIds([]);
    setCodeType("api");
    setCodeLang("sudolang");
    setCustomInstructions("");
    setGeneratedPrompt("");
    setGeneratedCode("");
    setCodeGenOpen(true);
  };

  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      const diagramIds = selectAll ? [] : selectedDiagramIds;
      if (!selectAll && diagramIds.length === 0) {
        toast.error(t("proj.select_diagram"));
        setGeneratingPrompt(false);
        return;
      }
      const res = await fetch(`${API}/projects/${projectId}/generate-prompt`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          diagram_ids: diagramIds,
          code_type: codeType,
          language: codeLang,
          custom_instructions: customInstructions || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPrompt(data.prompt);
        setCodeGenStep("prompt");
      } else {
        const err = await res.json();
        toast.error(err.detail || t("proj.prompt_gen_error"));
      }
    } catch (err) {
      toast.error(t("proj.net_error_prompt"));
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/generate-code`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: generatedPrompt,
          code_type: codeType,
          language: codeLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCode(data.code);
        setCodeGenStep("code");
        // Auto-save generated code as a project file
        if (data.code) {
          const ext = LANG_EXTENSIONS[codeLang] || "txt";
          const fileName = `${project?.name?.replace(/\s+/g, "_") || "generated"}.${ext}`;
          try {
            await fetch(`${API}/projects/${projectId}/files`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                type: "file",
                name: fileName,
                content: data.code,
                parent_path: "code",
              }),
            });
          } catch (_) { /* silent */ }
        }
      } else {
        const err = await res.json();
        toast.error(err.detail || t("proj.code_gen_error"));
      }
    } catch (err) {
      toast.error(t("proj.net_error_code"));
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "prompt") { setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2000); }
    else { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    toast.success(t("proj.copied"));
  };

  const downloadFile = (content, filename) => {
    downloadText(content, filename);
  };

  const toggleDiagramSelection = (diagId) => {
    setSelectedDiagramIds(prev =>
      prev.includes(diagId) ? prev.filter(id => id !== diagId) : [...prev, diagId]
    );
  };

  const LANG_EXTENSIONS = { sudolang: "sudo", python: "py", nodejs: "ts", java: "java", csharp: "cs", go: "go" };

  const handleExportProject = async (format = "json") => {
    const allowed = await checkLimit("export");
    if (!allowed) return;
    try {
      if (format === "zip") {
        // Use direct backend URL — cookie auth sent by browser, backend
        // returns Content-Disposition: attachment. Sandbox-safe via modal.
        const safeName = (project?.name || "proyecto").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 60);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        downloadFromUrl(`${API}/projects/${projectId}/export-zip`, `${safeName}-${stamp}.zip`);
      } else {
        const res = await fetch(`${API}/projects/${projectId}/export`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Export failed");
        const data = await res.json();
        downloadJson(data, `${project?.name || "proyecto"}.bpmn-export.json`);
      }
      toast.success(t("proj.export_success"));
    } catch (err) {
      toast.error(t("proj.export_error"));
    }
  };

  const openSummaryDialog = () => {
    setSummaryStep("config");
    setSummaryContext("");
    setGeneratedSummary("");
    setSummaryIncludeXml(true);
    setSummaryIncludeOop(true);
    setCopiedSummary(false);
    setLlmProvider("minimax");
    setLlmOutputType("code");
    setLlmLanguage("sudolang");
    setLlmResult("");
    setCopiedLlmResult(false);
    setSummaryOpen(true);
  };

  const handleGenerateSummary = async () => {
    const allowed = await checkLimit("ai");
    if (!allowed) return;
    setGeneratingSummary(true);
    setGeneratedSummary("");
    try {
      const res = await fetch(`${API}/ai/projects/${projectId}/generate-summary`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          include_xml: summaryIncludeXml,
          include_oop: summaryIncludeOop,
          custom_context: summaryContext || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedSummary(data.summary);
        setSummaryStep("prompt");
      } else {
        const err = await res.json();
        toast.error(err.detail || t("proj.summary_error"));
      }
    } catch (err) {
      toast.error(t("proj.net_error_summary"));
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleProcessWithLlm = async () => {
    setProcessingLlm(true);
    setLlmResult("");
    try {
      const res = await fetch(`${API}/ai/process-prompt`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: generatedSummary,
          llm_provider: llmProvider === "deepseek" && deepseekVariant === "flash" ? "deepseek-flash" : llmProvider,
          output_type: llmOutputType,
          language: llmLanguage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLlmResult(data.content);
        setSummaryStep("result");
      } else {
        const err = await res.json();
        toast.error(err.detail || t("proj.llm_error"));
      }
    } catch (err) {
      toast.error(t("proj.net_error_llm"));
    } finally {
      setProcessingLlm(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generatedSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
    toast.success(t("proj.copied"));
  };

  const copyLlmResult = () => {
    navigator.clipboard.writeText(llmResult);
    setCopiedLlmResult(true);
    setTimeout(() => setCopiedLlmResult(false), 2000);
    toast.success(t("proj.copied"));
  };

  const downloadSummary = () => {
    downloadText(
      generatedSummary,
      `${project?.name?.replace(/\s+/g, "_") || "proyecto"}_prompt.md`,
      "text/markdown",
    );
  };

  const LANG_EXT_MAP = { sudolang: "sudo", python: "py", nodejs: "ts", java: "java", csharp: "cs", go: "go" };

  const downloadLlmResult = () => {
    const ext = llmOutputType === "code" ? (LANG_EXT_MAP[llmLanguage] || "txt") : "md";
    downloadText(
      llmResult,
      `${project?.name?.replace(/\s+/g, "_") || "proyecto"}_${llmOutputType}.${ext}`,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-14 border-b border-zinc-200 px-6 flex items-center">
          <div className="animate-pulse h-5 bg-zinc-100 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="animate-pulse h-8 bg-zinc-100 w-64" />
          <div className="animate-pulse h-4 bg-zinc-50 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-zinc-200 p-4 space-y-3">
                <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
                <div className="animate-pulse h-3 bg-zinc-50 w-full" />
                <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const IconComp = ICON_MAP[project.icon] || Folder;
  const projectDiagramIds = project.diagram_ids || [];
  const availableDiagrams = allDiagrams.filter(
    d => !projectDiagramIds.includes(d.id) &&
    (d.name.toLowerCase().includes(diagSearch.toLowerCase()) ||
     (d.description || "").toLowerCase().includes(diagSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="project-detail-page">
      {/* Top Menu Bar */}
      <ProjectMenuBar
        projectId={projectId}
        explorerOpen={explorerOpen}
        onToggleExplorer={() => setExplorerOpen(v => !v)}
        showFiles={showFiles}
        onToggleShowFiles={() => setShowFiles(v => !v)}
        onExport={handleExportProject}
        onAddDiagram={openAddDialog}
        onNewDiagram={() => navigate("/editor")}
        onGeneratePrompt={openSummaryDialog}
        onGenerateCode={openCodeGen}
        onAiRequirements={() => setAiReqOpen(true)}
        onAIRewriteMd={handleAIRewriteMd}
        aiRewriteLoading={aiRewriteLoading}
      />

      {/* Branch badge bar */}
      <div className="flex items-center justify-end px-4 py-1 bg-zinc-50 border-b border-zinc-100">
        <BranchBadge projectId={projectId} />
      </div>

      {/* Body: Explorer + Content */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectTree
          key={treeRefreshKey}
          isOpen={explorerOpen}
          onToggle={() => setExplorerOpen(v => !v)}
          projects={project ? [project] : []}
          loading={loading}
          onFileSelect={handleProjectTreeFileSelect}
          onFileDelete={(node, _projectId) => setDeleteFileTarget({ id: node._projectFileId, name: node.name })}
          autoExpand={true}
          showFiles={showFiles}
        />

        {/* Main Content */}
        {selectedFile ? (
          <div className="flex-1 min-w-0 flex flex-col bg-white">
            <div className="border-b border-zinc-200 px-4 py-2 flex items-center justify-between flex-shrink-0 h-10">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className={`w-4 h-4 flex-shrink-0 ${selectedFile.name?.endsWith(".md") ? "text-blue-500" : "text-zinc-400"}`} />
                <span className="text-xs font-bold text-zinc-700 truncate" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {selectedFile.name}
                </span>
                {saveStatus === "saving" && <Loader2 className="w-3 h-3 text-zinc-400 animate-spin flex-shrink-0" />}
                {saveStatus === "saved" && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                {saveStatus === "error" && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1">
                {/* AI Rewrite button */}
                {selectedFile.name?.endsWith(".md") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`p-1 transition-colors flex-shrink-0 ${aiRewriteLoading ? "text-blue-600" : "text-zinc-400 hover:text-blue-500"}`}
                        title="Reescribir con IA"
                        disabled={aiRewriteLoading}
                      >
                        {aiRewriteLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200 shadow-md min-w-[220px]">
                      <div className="px-3 py-1.5 border-b border-zinc-200">
                        <p className="text-[10px] font-semibold text-zinc-700" style={{ fontFamily: "'Chivo', sans-serif" }}>
                          Reescribir con IA
                        </p>
                        <p className="text-[9px] text-zinc-400">DeepSeek V4 Pro</p>
                      </div>
                      {AI_REWRITE_PROMPTS.map((promptDef) => (
                        <DropdownMenuItem
                          key={promptDef.label}
                          className="rounded-lg text-xs cursor-pointer"
                          onClick={() => handleAIRewriteMd(promptDef)}
                        >
                          <Sparkles className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold">{promptDef.label}</span>
                            <span className="text-[9px] text-zinc-400 leading-tight">{promptDef.description}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {/* GitHub Push button */}
                {project?.github_repo_url && (
                  <button
                    type="button"
                    onClick={handlePushToGithub}
                    disabled={pushingToGithub}
                    className="p-1 text-zinc-400 hover:text-purple-500 transition-colors flex-shrink-0"
                    title="Actualizar GitHub"
                  >
                    {pushingToGithub ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
                {/* Delete file button */}
                {selectedFile.id && (
                  <button
                    type="button"
                    onClick={() => setDeleteFileTarget(selectedFile)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-zinc-100 transition-colors"
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <MarkdownEditor
                value={editContent}
                onChange={handleContentChange}
                rows={30}
                placeholder="Escribe aquí..."
                dataTestId="project-md-editor"
              />
            </div>
          </div>
        ) : (
        <main className="flex-1 min-w-0 overflow-y-auto">
          <FreePlanBanner />
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-zinc-200/70 h-11 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
              <Link to="/projects" className="flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-100">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (project?.color || "#7C3AED") + "18" }}
              >
                <IconComp className="w-3.5 h-3.5" style={{ color: project?.color || "#7C3AED" }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-zinc-800 leading-tight truncate" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-[10px] text-zinc-400 leading-tight truncate">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button
                onClick={() => setShareOpen(true)}
                variant="ghost"
                size="icon"
                data-testid="share-project-btn"
                className="h-7 w-7 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700"
                title="Permisos"
              >
                <Shield className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="export-project-btn" className="rounded-lg h-7 text-[11px] gap-1 px-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 font-medium">
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Exportar</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="rounded-xl border border-zinc-200 shadow-lg shadow-zinc-200/50 w-56 p-1">
                  <DropdownMenuItem
                    onClick={() => handleExportProject("zip")}
                    data-testid="export-project-zip-option"
                    className="rounded-lg cursor-pointer text-xs py-2"
                  >
                    <FileArchive className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                    <div className="flex flex-col">
                      <span className="font-semibold">ZIP — diagramas separados</span>
                      <span className="text-[10px] text-zinc-400">.bpmn por diagrama + metadata.json</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportProject("json")}
                    data-testid="export-project-json-option"
                    className="rounded-lg cursor-pointer text-xs py-2"
                  >
                    <FileJson className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                    <div className="flex flex-col">
                      <span className="font-semibold">JSON unico</span>
                      <span className="text-[10px] text-zinc-400">Compatible con import legacy</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isAuthenticated ? (
              <>
              <Link to="/editor">
                <Button
                  data-testid="new-diagram-in-project-btn"
                  size="sm"
                  className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-7 text-[11px] font-semibold px-2.5 ml-1 shadow-sm shadow-zinc-900/10"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Nuevo</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="project-more-btn" className="h-7 w-7 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 ml-0.5">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="rounded-xl border border-zinc-200 shadow-lg shadow-zinc-200/50 w-48 p-1">
                  <DropdownMenuItem onClick={openCodeGen} data-testid="generate-code-btn" className="rounded-lg cursor-pointer text-xs py-2">
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    {t("proj.generate_code")}
                  </DropdownMenuItem>
                  <Link to={`/specs?project_id=${projectId}`} className="no-underline">
                    <DropdownMenuItem data-testid="project-specs-btn" className="rounded-lg cursor-pointer text-xs py-2">
                      <FileText className="w-3.5 h-3.5 mr-2 text-violet-500" />
                      Especificaciones
                      {specsCount > 0 && (
                        <span className="ml-auto bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {specsCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <Link to={`/projects/${projectId}/versions`} className="no-underline">
                    <DropdownMenuItem data-testid="project-tree-btn" className="rounded-lg cursor-pointer text-xs py-2">
                      <GitBranch className="w-3.5 h-3.5 mr-2 text-amber-500" />
                      Versiones
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={openAddDialog} data-testid="add-existing-diagram-btn" className="rounded-lg cursor-pointer text-xs py-2">
                    <LinkIcon className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                    {t("proj.add_existing")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
              ) : (
              <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="rounded-lg h-7 text-[11px]">
                {t("proj.login_to_edit")}
              </Button>
              )}
            </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Project Info */}
          {project.tags?.length > 0 && (
            <div className="flex gap-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {/* AI Requirements CTA — visible only when the project has no specs yet */}
          {isAuthenticated && specsCount === 0 && (
            <div
              className="border-2 border-dashed border-blue-300 bg-blue-50/50 p-5 flex items-start gap-4"
              data-testid="ai-requirements-empty-cta"
            >
              <div className="w-10 h-10 bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-sm font-bold text-zinc-900 tracking-tight"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  Empieza por los requirements (recomendado)
                </h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Describe lo que quieres construir y la IA generara los requirements MoSCoW + RACI
                  automaticamente. Despues podras vincularlos a diagramas BPMN y clases OOP.
                </p>
              </div>
              <Button
                onClick={() => setAiReqOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs font-bold whitespace-nowrap"
                data-testid="open-ai-requirements-dialog"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generar con IA
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100">
                  <FileCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{project.diagrams?.length || 0}</p>
                  <p className="text-sm text-zinc-500">{t("proj.diagrams")}</p>
                </div>
              </CardContent>
            </Card>
            <Link to={`/projects/${projectId}/versions`}>
              <Card className="hover:bg-zinc-50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100">
                    <GitBranch className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900">
                      {project.diagrams?.reduce((sum, d) => sum + (d.current_version || 1), 0) || 0}
                    </p>
                    <p className="text-sm text-zinc-500">{t("proj.total_versions")}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {project.updated_at ? new Date(project.updated_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </p>
                  <p className="text-sm text-zinc-500">{t("proj.last_update")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full mt-6" data-testid="project-tabs">
            <TabsList className="rounded-lg bg-zinc-100 p-1 mb-4 inline-flex h-auto">
              <TabsTrigger value="overview" className="rounded-md text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Vista general
              </TabsTrigger>
              <TabsTrigger value="diagrams" className="rounded-md text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Diagramas ({project.diagrams?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-6">
              <ComponentOverview projectId={projectId} />

              {/* GitHub Repository */}
              <div className="space-y-3" data-testid="github-repo-section">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              GitHub
            </h2>
            {project.github_repo_url ? (
              <div className="border border-zinc-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
                      <Github className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {project.github_repo_url.replace("https://github.com/", "")}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-lg font-mono">
                          {project.github_default_branch || "main"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-lg font-mono">
                          {project.github_sync_path || "bpmn/"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkGitHub}
                    className="text-[10px] text-red-500 hover:text-red-700 h-7"
                  >
                    Desvincular
                  </Button>
                </div>
                {project.github_last_sync && (
                  <p className="text-[10px] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Ultima sync: {new Date(project.github_last_sync).toLocaleString("es-ES")}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePushAll}
                    disabled={pushingAll}
                    className="text-xs h-7"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {pushingAll ? "Push..." : "Push all"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePullAll}
                    disabled={pullingAll}
                    className="text-xs h-7"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {pullingAll ? "Pull..." : "Pull all"}
                  </Button>
                </div>
                {gitHubResult && gitHubResult.results && (
                  <div className="border-t border-zinc-100 pt-2 max-h-32 overflow-y-auto">
                    {gitHubResult.results.map((r, i) => (
                      <div key={i} className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 py-0.5">
                        <span className={r.status === "pushed" || r.status === "updated" ? "text-emerald-600" : r.status === "error" ? "text-red-500" : "text-zinc-400"}>
                          {r.status}
                        </span>
                        <span className="truncate">{r.file_path || r.file || r.diagram_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-300 p-4 text-center">
                <p className="text-xs text-zinc-500 mb-3">Vincula un repositorio GitHub para sincronizar diagramas</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGitHubModal(true)}
                  className="text-xs h-7"
                >
                  <Github className="w-3.5 h-3.5 mr-1.5" />
                  Vincular repositorio
                </Button>
              </div>
            )}
          </div>
            </TabsContent>

          {/* GitHub Link Modal */}
          <Dialog open={showGitHubModal} onOpenChange={setShowGitHubModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular repositorio GitHub</DialogTitle>
                <DialogDescription>
                  {user?.github_login
                    ? "Conecta este proyecto a un repositorio GitHub."
                    : "Conecta tu cuenta GitHub y vincula este proyecto a un repositorio."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!user?.github_login && (
                  <>
                    <div className="border-b border-zinc-200 pb-3 mb-1">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                        Cuenta GitHub
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="github-login">Usuario de GitHub</Label>
                          <Input
                            id="github-login"
                            placeholder="tu-usuario"
                            value={linkGithubLogin}
                            onChange={(e) => setLinkGithubLogin(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github-token">Token de acceso (PAT)</Label>
                          <Input
                            id="github-token"
                            type="password"
                            placeholder="ghp_..."
                            value={linkGithubToken}
                            onChange={(e) => setLinkGithubToken(e.target.value)}
                          />
                          <p className="text-xs text-zinc-400 mt-1">
                            <a
                              href="https://github.com/settings/tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-zinc-600"
                            >
                              Crear token en GitHub &rarr;
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="repo-url">URL del repositorio</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/usuario/repo"
                    value={linkRepoUrl}
                    onChange={(e) => setLinkRepoUrl(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Rama</Label>
                    <Input
                      id="branch"
                      value={linkBranch}
                      onChange={(e) => setLinkBranch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sync-path">Ruta de sync</Label>
                    <Input
                      id="sync-path"
                      value={linkSyncPath}
                      onChange={(e) => setLinkSyncPath(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t border-zinc-200">
                  <Checkbox
                    id="repo-private"
                    checked={linkRepoPrivate}
                    onCheckedChange={(checked) => setLinkRepoPrivate(checked === true)}
                  />
                  <Label htmlFor="repo-private" className="text-sm cursor-pointer">
                    Repositorio privado
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGitHubModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleLinkGitHub}
                  disabled={
                    linkingInProgress ||
                    !linkRepoUrl.trim() ||
                    (!user?.github_login && (!linkGithubLogin.trim() || !linkGithubToken.trim()))
                  }
                >
                  {linkingInProgress ? "Vinculando..." : "Vincular"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

            <TabsContent value="diagrams" className="mt-0">

          {/* Diagrams List */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t("proj.project_diagrams")}</h2>
            {!project.diagrams || project.diagrams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                <FileCode className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-zinc-700 mb-1">{t("proj.no_diagrams")}</h3>
                <p className="text-sm text-zinc-500 mb-4">{t("proj.no_diagrams_desc")}</p>
                {isAuthenticated && (
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={openAddDialog} variant="outline" size="sm">
                    <LinkIcon className="w-4 h-4 mr-2" />{t("proj.add_existing")}
                  </Button>
                  <Link to="/editor">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />{t("common.new")}
                    </Button>
                  </Link>
                </div>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.diagrams.map((diagram) => (
                  <Card
                    key={diagram.id}
                    className="group hover:shadow-md transition-all border-zinc-200"
                    data-testid={`diagram-card-${diagram.id}`}
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Link to={`/editor/${diagram.id}`} className="flex-1">
                            <div className="flex items-center gap-2.5 mb-2">
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileCode className="w-4 h-4 text-blue-600" />
                              </div>
                              <h4 className="font-medium text-zinc-900 line-clamp-1">{diagram.name}</h4>
                            </div>
                          </Link>
                          {isAuthenticated && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/editor/${diagram.id}`}>
                                  <ExternalLink className="w-4 h-4 mr-2" />{t("proj.open_editor")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setRemoveDiagram(diagram)} className="text-red-600">
                                <Unlink className="w-4 h-4 mr-2" />{t("proj.remove_from_project")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </div>
                        {diagram.description && (
                          <p className="text-sm text-zinc-500 mb-2 line-clamp-2">{diagram.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3.5 h-3.5" />v{diagram.current_version || 1}
                          </span>
                          {diagram.tags?.length > 0 && (
                            <div className="flex gap-1">
                              {diagram.tags.slice(0, 2).map(t => (
                                <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
        )}
      </div>{/* close flex body */}

      {/* Add Diagram Dialog */}
      <Dialog open={addDiagramOpen} onOpenChange={setAddDiagramOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("proj.add_diagram_title")}</DialogTitle>
            <DialogDescription>{t("proj.add_diagram_desc")} "{project.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={diagSearch}
                onChange={(e) => setDiagSearch(e.target.value)}
                placeholder={t("proj.search_diagrams")}
                className="pl-10"
                data-testid="search-diagrams-to-add"
              />
            </div>
            <ScrollArea className="h-64">
              {loadingDiagrams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : availableDiagrams.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">
                  {diagSearch ? t("proj.no_search_results") : t("proj.all_added")}
                </p>
              ) : (
                <div className="space-y-1">
                  {availableDiagrams.map(d => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileCode className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{d.name}</p>
                          {d.description && (
                            <p className="text-xs text-zinc-500 truncate">{d.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addDiagram(d.id)}
                        data-testid={`add-diagram-${d.id}`}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />{t("common.create")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDiagramOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Diagram Confirmation */}
      <AlertDialog open={!!removeDiagram} onOpenChange={(open) => !open && setRemoveDiagram(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("proj.remove_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("proj.remove_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDiagram} className="bg-red-600 hover:bg-red-700">
              {t("proj.remove_btn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete File Confirmation Dialog */}
      <AlertDialog open={!!deleteFileTarget} onOpenChange={(open) => !open && setDeleteFileTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar "{deleteFileTarget?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Code Generation Dialog */}
      <Dialog open={codeGenOpen} onOpenChange={setCodeGenOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              {t("proj.code_gen_title")}
            </DialogTitle>
            <DialogDescription>
              {t("proj.code_gen_desc")}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 px-1">
            {[
              { key: "config", label: t("proj.step_config"), icon: <Settings className="w-3.5 h-3.5" /> },
              { key: "prompt", label: t("proj.step_prompt"), icon: <Terminal className="w-3.5 h-3.5" /> },
              { key: "code", label: t("proj.step_code"), icon: <Code2 className="w-3.5 h-3.5" /> },
            ].map((step, i) => (
              <React.Fragment key={step.key}>
                {i > 0 && <div className="flex-1 h-px bg-zinc-200" />}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    codeGenStep === step.key
                      ? "bg-emerald-100 text-emerald-700"
                      : ["config", "prompt", "code"].indexOf(codeGenStep) > ["config", "prompt", "code"].indexOf(step.key)
                      ? "bg-zinc-100 text-zinc-600"
                      : "text-zinc-400"
                  }`}
                >
                  {step.icon}
                  {step.label}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Step 1: Configuration */}
            {codeGenStep === "config" && (
              <div className="space-y-5 p-1">
                {/* Diagram Selection */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t("proj.diagrams")}</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={(checked) => { setSelectAll(checked); if (checked) setSelectedDiagramIds([]); }}
                        data-testid="select-all-diagrams"
                      />
                      <span className="text-sm font-medium">{t("proj.all_diagrams")} ({project?.diagrams?.length || 0})</span>
                    </label>
                    {!selectAll && project?.diagrams && (
                      <div className="ml-6 space-y-1.5 border-l-2 border-zinc-200 pl-3">
                        {project.diagrams.map(d => (
                          <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedDiagramIds.includes(d.id)}
                              onCheckedChange={() => toggleDiagramSelection(d.id)}
                              data-testid={`select-diagram-${d.id}`}
                            />
                            <FileCode className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-sm">{d.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Type */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t("proj.code_type")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "api", label: t("proj.api_backend"), desc: t("proj.api_backend_desc"), icon: <Cpu className="w-5 h-5" /> },
                      { value: "automation", label: t("proj.automation"), desc: t("proj.automation_desc"), icon: <Terminal className="w-5 h-5" /> },
                      { value: "custom", label: t("proj.custom"), desc: t("proj.custom_desc"), icon: <Wand2 className="w-5 h-5" /> },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setCodeType(opt.value)}
                        data-testid={`code-type-${opt.value}`}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          codeType === opt.value
                            ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`mb-1.5 ${codeType === opt.value ? "text-emerald-600" : "text-zinc-400"}`}>
                          {opt.icon}
                        </div>
                        <p className="text-sm font-medium text-zinc-900">{opt.label}</p>
                        <p className="text-xs text-zinc-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t("proj.language")}</Label>
                  <Select value={codeLang} onValueChange={setCodeLang}>
                    <SelectTrigger data-testid="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sudolang">SudoLang (Principal)</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="nodejs">Node.js (TypeScript)</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Instructions */}
                {codeType === "custom" && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">{t("proj.custom_instructions")}</Label>
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Ej: Genera un microservicio con RabbitMQ para manejar eventos entre los procesos..."
                      rows={4}
                      data-testid="custom-instructions-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Editable Prompt */}
            {codeGenStep === "prompt" && (
              <div className="space-y-3 p-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Prompt generado (editable)</Label>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => copyToClipboard(generatedPrompt, "prompt")}
                      data-testid="copy-prompt-btn"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedPrompt ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => downloadFile(generatedPrompt, `prompt_${project?.name?.replace(/\s+/g, "_")}.md`)}
                      data-testid="download-prompt-btn"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />Descargar
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="font-mono text-sm min-h-[340px] resize-none"
                  data-testid="editable-prompt"
                />
                <p className="text-xs text-zinc-500">
                  Puedes editar el prompt antes de generar el codigo. Tambien puedes copiarlo para usar en otro LLM.
                </p>
              </div>
            )}

            {/* Step 3: Generated Code */}
            {codeGenStep === "code" && (
              <div className="space-y-3 p-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Codigo generado</Label>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => copyToClipboard(generatedCode, "code")}
                      data-testid="copy-code-btn"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedCode ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => downloadFile(generatedCode, `${project?.name?.replace(/\s+/g, "_")}.${LANG_EXTENSIONS[codeLang] || "txt"}`)}
                      data-testid="download-code-btn"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />Descargar
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-deep-navy text-zinc-100 rounded-lg p-4 overflow-auto text-sm font-mono max-h-[380px]" data-testid="generated-code-display">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            {codeGenStep === "config" && (
              <>
                <Button variant="outline" onClick={() => setCodeGenOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleGeneratePrompt}
                  disabled={generatingPrompt || (!selectAll && selectedDiagramIds.length === 0)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="generate-prompt-btn"
                >
                  {generatingPrompt && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generar Prompt
                </Button>
              </>
            )}
            {codeGenStep === "prompt" && (
              <>
                <Button variant="outline" onClick={() => setCodeGenStep("config")}>Atras</Button>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generatingCode || !generatedPrompt.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="generate-code-btn-action"
                >
                  {generatingCode && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {generatingCode ? "Generando..." : "Generar Codigo con IA"}
                </Button>
              </>
            )}
            {codeGenStep === "code" && (
              <>
                <Button variant="outline" onClick={() => setCodeGenStep("prompt")}>Ver Prompt</Button>
                <Button variant="outline" onClick={() => { setCodeGenStep("config"); setGeneratedCode(""); setGeneratedPrompt(""); }}>
                  Nueva Generacion
                </Button>
                <Button onClick={() => setCodeGenOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
                  Cerrar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary / Prompt Generation Dialog - Multi-step */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Generar Prompt del Proyecto
            </DialogTitle>
            <DialogDescription>
              Genera un resumen con IA y envialo a un LLM para obtener codigo o documentacion
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 px-1">
            {[
              { key: "config", label: "Opciones" },
              { key: "prompt", label: "Prompt" },
              { key: "result", label: "Resultado" },
            ].map((s, i) => (
              <React.Fragment key={s.key}>
                {i > 0 && <div className="flex-1 h-px bg-zinc-200" />}
                <div className={`px-3 py-1 text-xs font-semibold transition-colors ${
                  summaryStep === s.key
                    ? "bg-blue-100 text-blue-700"
                    : ["config", "prompt", "result"].indexOf(summaryStep) > ["config", "prompt", "result"].indexOf(s.key)
                    ? "bg-zinc-100 text-zinc-600"
                    : "text-zinc-400"
                }`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {s.label}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Step 1: Config */}
            {summaryStep === "config" && (
              <div className="space-y-4 p-1">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>OPCIONES</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={summaryIncludeXml} onCheckedChange={setSummaryIncludeXml} data-testid="summary-include-xml" />
                      <span className="text-sm">Incluir XML completo de los diagramas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={summaryIncludeOop} onCheckedChange={setSummaryIncludeOop} data-testid="summary-include-oop" />
                      <span className="text-sm">Incluir clases OOP asociadas</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>CONTEXTO ADICIONAL</Label>
                  <Textarea
                    value={summaryContext}
                    onChange={(e) => setSummaryContext(e.target.value)}
                    placeholder="Opcional: agrega contexto sobre el proyecto, industria, requisitos..."
                    rows={3}
                    className="rounded-lg text-sm"
                    data-testid="summary-context-input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MODELO IA</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {llmProviders.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setLlmProvider(p.key)}
                        className={`text-left p-3 border-2 transition-all ${
                          llmProvider === p.key
                            ? "border-blue-600 bg-blue-50"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                        data-testid={`summary-llm-${p.key}`}
                      >
                        <span className="text-xs font-bold block">{p.label}</span>
                        <span className="text-[10px] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatProviderCost(p)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-xs text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Se analizaran {project?.diagrams?.length || 0} diagramas usando {{"deepseek":"DeepSeek V4-Pro","minimax":"MiniMax M3","mimo":"MiMo-V2-Pro","opencode":"OpenCode Zen","opencode-go":"OpenCode Go"}[llmProvider]}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Prompt + LLM options */}
            {summaryStep === "prompt" && (
              <div className="space-y-4 p-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>PROMPT GENERADO</Label>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={copySummary} data-testid="copy-summary-btn" className="rounded-lg h-7 text-xs">
                      {copiedSummary ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedSummary ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadSummary} data-testid="download-summary-btn" className="rounded-lg h-7 text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      .md
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedSummary}
                  onChange={(e) => setGeneratedSummary(e.target.value)}
                  className="font-mono text-xs min-h-[180px] max-h-[220px] resize-none rounded-lg"
                  data-testid="summary-output"
                />

                <div className="border border-zinc-200 p-4 space-y-3 bg-zinc-50">
                  <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ENVIAR A LLM</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-zinc-500 mb-1.5 block">Modelo</Label>
                      <div className="flex gap-2">
                        {[
                          { value: "deepseek", label: "DeepSeek V4-Pro" },
                          { value: "minimax", label: "MiniMax M3" },
                          { value: "mimo", label: "MiMo-V2-Pro" },
                          { value: "opencode", label: "OpenCode Zen" },
                          { value: "opencode-go", label: "OpenCode Go" },
                        ].map((m) => (
                          <button
                            key={m.value}
                            onClick={() => setLlmProvider(m.value)}
                            data-testid={`llm-provider-${m.value}`}
                            className={`flex-1 px-3 py-2 text-xs font-medium border transition-all ${
                              llmProvider === m.value
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                      {llmProvider === "deepseek" && (
                        <div className="flex items-center gap-1 mt-2">
                          {[
                            { v: "pro", label: "Pro" },
                            { v: "flash", label: "Flash" },
                          ].map((x) => (
                            <button
                              key={x.v}
                              onClick={() => setDeepseekVariant(x.v)}
                              data-testid={`deepseek-variant-${x.v}`}
                              className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 border transition-colors ${
                                deepseekVariant === x.v
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              }`}
                              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                              {x.label}
                            </button>
                          ))}
                          {(() => {
                            const sug = suggestDeepseekVariant(generatedSummary);
                            if (!sug || sug === deepseekVariant) return null;
                            return (
                              <button
                                onClick={() => setDeepseekVariant(sug)}
                                className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-1 border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                title={NUDGE_COPY[sug]}
                                data-testid="proj-variant-nudge"
                              >
                                <Lightbulb className="w-3 h-3" strokeWidth={2.5} />
                                Sug: {sug === "flash" ? "Flash" : "Pro"}
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-500 mb-1.5 block">Tipo de salida</Label>
                      <div className="flex gap-2">
                        {[
                          { value: "code", label: "Codigo" },
                          { value: "docs", label: "Documentacion" },
                        ].map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setLlmOutputType(t.value)}
                            data-testid={`llm-output-${t.value}`}
                            className={`flex-1 px-3 py-2 text-xs font-medium border transition-all ${
                              llmOutputType === t.value
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {llmOutputType === "code" && (
                    <div>
                      <Label className="text-xs text-zinc-500 mb-1.5 block">Lenguaje</Label>
                      <Select value={llmLanguage} onValueChange={setLlmLanguage}>
                        <SelectTrigger className="h-8 rounded-lg text-xs" data-testid="llm-language-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sudolang">SudoLang (Principal)</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="nodejs">Node.js (TypeScript)</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: LLM Result */}
            {summaryStep === "result" && (
              <div className="flex-1 overflow-hidden flex flex-col space-y-3 p-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {llmOutputType === "code" ? "CODIGO GENERADO" : "DOCUMENTACION"}
                    </Label>
                    <Badge variant="secondary" className="text-[10px]">{{"deepseek":"DeepSeek V4-Pro","deepseek-flash":"DeepSeek V4-Flash","minimax":"MiniMax M3","mimo":"MiMo-V2-Pro","opencode":"OpenCode Zen","opencode-go":"OpenCode Go"}[llmProvider] || llmProvider}</Badge>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={copyLlmResult} data-testid="copy-llm-result-btn" className="rounded-lg h-7 text-xs">
                      {copiedLlmResult ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedLlmResult ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadLlmResult} data-testid="download-llm-result-btn" className="rounded-lg h-7 text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
                  {llmOutputType === "code" ? (
                    <pre className="bg-deep-navy text-zinc-100 p-4 overflow-auto text-sm font-mono" data-testid="llm-result-output">
                      <code>{llmResult}</code>
                    </pre>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-zinc-800 leading-relaxed font-sans p-2" data-testid="llm-result-output">
                      {llmResult}
                    </pre>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            {summaryStep === "config" && (
              <>
                <Button variant="outline" onClick={() => setSummaryOpen(false)} className="rounded-lg">Cancelar</Button>
                <Button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                  data-testid="generate-summary-action-btn"
                >
                  {generatingSummary && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {generatingSummary ? "Generando..." : "Generar Prompt"}
                </Button>
              </>
            )}
            {summaryStep === "prompt" && (
              <>
                <Button variant="outline" onClick={() => { setSummaryStep("config"); setGeneratedSummary(""); }} className="rounded-lg">Atras</Button>
                <Button
                  onClick={handleProcessWithLlm}
                  disabled={processingLlm || !generatedSummary.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                  data-testid="send-to-llm-btn"
                >
                  {processingLlm && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {processingLlm ? "Procesando..." : `Enviar a ${{"deepseek":"DeepSeek V4-Pro","deepseek-flash":"DeepSeek V4-Flash","minimax":"MiniMax M3","mimo":"MiMo-V2-Pro","opencode":"OpenCode Zen","opencode-go":"OpenCode Go"}[llmProvider] || llmProvider}`}
                </Button>
              </>
            )}
            {summaryStep === "result" && (
              <>
                <Button variant="outline" onClick={() => { setSummaryStep("prompt"); setLlmResult(""); }} className="rounded-lg">
                  Ver Prompt
                </Button>
                <Button variant="outline" onClick={() => { setSummaryStep("config"); setGeneratedSummary(""); setLlmResult(""); }} className="rounded-lg">
                  Nueva Generacion
                </Button>
                <Button onClick={() => setSummaryOpen(false)} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Cerrar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} limitType={upgradeInfo.type} limitMax={upgradeInfo.max} limitCurrent={upgradeInfo.current} />

      {/* AI Requirements Dialog (project detail) */}
      <Dialog open={aiReqOpen} onOpenChange={(o) => !aiReqLoading && setAiReqOpen(o)}>
        <DialogContent className="sm:max-w-2xl rounded-lg" data-testid="ai-requirements-dialog">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight flex items-center gap-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
              <Sparkles className="w-4 h-4 text-blue-600" />
              Generar requirements con IA
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Describe lo que quieres construir. La IA generara MoSCoW + RACI automaticamente.
            </DialogDescription>
          </DialogHeader>

          {/* .md file selector from descripcion folder */}
          {descFilesLoading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
              <span className="text-[10px] text-zinc-400">Buscando archivos .md...</span>
            </div>
          ) : descripcionFiles.length > 0 ? (
            <div className="border border-zinc-200 bg-zinc-50/50">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-zinc-100 transition-colors"
                onClick={() => setDescFilesOpen((v) => !v)}
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-semibold text-zinc-700">
                  Archivos .md del proyecto
                </span>
                <Badge variant="outline" className="rounded-lg text-[10px] h-4 px-1.5 ml-1">
                  {descripcionFiles.length}
                </Badge>
                <div className="flex-1" />
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${descFilesOpen ? "rotate-180" : ""}`} />
              </button>
              {descFilesOpen && (
                <div className="border-t border-zinc-200">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-100">
                    <button
                      type="button"
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                      onClick={handleSelectAllFiles}
                    >
                      {selectedFileIds.size === descripcionFiles.length ? "Deseleccionar todos" : "Seleccionar todos"}
                    </button>
                    <span className="text-[10px] text-zinc-400">
                      {selectedFileIds.size} de {descripcionFiles.length} seleccionados
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {descripcionFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 cursor-pointer text-xs"
                        onClick={() => handleToggleFile(f.id)}
                      >
                        <Checkbox
                          checked={selectedFileIds.has(f.id)}
                          className="pointer-events-none"
                        />
                        <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="text-zinc-700 truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-200 px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-7 text-[10px]"
                      disabled={selectedFileIds.size === 0}
                      onClick={handleUseSelectedFiles}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Usar seleccionados como descripcion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-400 italic">
              No hay archivos .md en la carpeta descripcion. Puedes escribir tu descripcion abajo o crear archivos en el editor de archivos del proyecto.
            </p>
          )}

          <div className="space-y-3 mt-2">
            <Textarea
              value={aiReqBrief}
              onChange={(e) => setAiReqBrief(e.target.value)}
              placeholder="Ej: Plataforma de onboarding de candidatos. Reclutadores suben CVs PDF, el sistema valida, extrae datos con IA y notifica al hiring manager. GDPR..."
              rows={6}
              maxLength={200000}
              disabled={aiReqLoading}
              className="rounded-lg text-sm"
              data-testid="project-ai-brief-textarea"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Modelo IA
                </span>
                <select
                  value={aiReqModel}
                  onChange={(e) => setAiReqModel(e.target.value)}
                  disabled={aiReqLoading}
                  className="h-8 rounded-lg border border-zinc-300 px-2 text-xs bg-white"
                  data-testid="project-ai-model-select"
                >
                  <option value="deepseek-pro">DeepSeek V4-Pro (1M ctx)</option>
                  <option value="deepseek-flash">DeepSeek V4-Flash</option>
                  <option value="minimax">MiniMax M3</option>
                  <option value="mimo">MiMo-V2-Pro (1M ctx)</option>
                  <option value="opencode">OpenCode Zen</option>
                  <option value="opencode-go">OpenCode Go</option>
                </select>
              </div>
              <span
                className={`text-[10px] tracking-wider tabular-nums ${aiReqBrief.length >= 30 ? "text-emerald-700" : "text-zinc-400"}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {aiReqBrief.length}/200000 {aiReqBrief.length >= 30 ? "✓" : "(min 30)"}
              </span>
            </div>

            {aiReqLoading && (
              <div className="border border-blue-200 bg-blue-50 p-3 flex items-center gap-3" data-testid="ai-req-loading">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-900">Generando requirements...</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">15-45 segundos. La IA analiza tu descripcion y genera MoSCoW + RACI.</div>
                </div>
              </div>
            )}

            {aiReqResult && !aiReqLoading && (
              <div className="border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3" data-testid="ai-req-success">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-900">
                    ✓ {aiReqResult.requirements_created} requirements generados
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 line-clamp-2">
                    {aiReqResult.summary}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setAiReqOpen(false)}
              disabled={aiReqLoading}
              className="rounded-lg h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateAiRequirements}
              disabled={aiReqLoading || aiReqBrief.trim().length < 30}
              className="rounded-lg h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              data-testid="confirm-generate-requirements"
            >
              {aiReqLoading ? (<><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generando...</>) : (<><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generar</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GitHubStatusBar />

      <ShareResourceDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resource={project ? { id: project.id, name: project.name, type: "project" } : null}
      />

      <AiLoadingOverlay
        show={aiReqLoading}
        statusText="Generando requirements..."
        subText="DeepSeek V4 esta analizando el proyecto y generando requirements MoSCoW. Esto puede tardar 15-45 segundos."
      />
    </div>

  );
};

export default ProjectDetailPage;
