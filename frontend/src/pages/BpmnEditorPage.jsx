// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidationDialog } from "@/components/ValidationDialog";
import { UMLDialog } from "@/components/UMLDialog";
import { SimulatorDialog } from "@/components/SimulatorDialog";
import { useEditorNotifications } from "@/hooks/useEditorNotifications";
import { useVersionDiff } from "@/hooks/useVersionDiff";
import { useElementIO } from "@/hooks/useElementIO";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { downloadBlob, downloadText } from "@/lib/downloadFile";
import { useI18n } from "@/contexts/I18nContext";
import { AnalyticsDialog } from "@/components/AnalyticsDialog";
import { DocsDialog } from "@/components/DocsDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Workflow,
  Save,
  Download,
  Upload,
  Plus,
  FileCode,
  GitBranch,
  History,
  MessageSquare,
  Code2,
  Puzzle,
  FileText,
  Sparkles,
  Lightbulb,
  Terminal,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
  Layers,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  RotateCcw,
  Send,
  X,
  Eye,
  Loader2,
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  Pencil,
  Github,
  ArrowUp,
  ArrowDown,
  Trash2,
  Shield,
  BarChart3,
} from "lucide-react";
import LinkedRequirementsWidget from "@/components/LinkedRequirementsWidget";
import MoscowCanvasOverlay from "@/components/MoscowCanvasOverlay";
import OrphanedLinksDialog from "@/components/OrphanedLinksDialog";
import { PropertiesTab } from "@/components/editor-panels/PropertiesTab";
import { CommentsTab } from "@/components/editor-panels/CommentsTab";
import { OopTab } from "@/components/editor-panels/OopTab";
import { ComponentsTab } from "@/components/editor-panels/ComponentsTab";
import { RequirementsTab } from "@/components/editor-panels/RequirementsTab";
import { SaveVersionDialog } from "@/components/editor-panels/SaveVersionDialog";
import { AIGeneratorDialog } from "@/components/editor-panels/AIGeneratorDialog";
import { AISuggestions } from "@/components/editor-panels/AISuggestions";
import { HistorySheet } from "@/components/editor-panels/HistorySheet";
import { BranchManagementDialog } from "@/components/editor-panels/BranchManagementDialog";
import { MergePreviewDialog } from "@/components/editor-panels/MergePreviewDialog";
import { SummaryLlmDialog } from "@/components/editor-panels/SummaryLlmDialog";
import { useUpgradeModal } from "@/contexts/UpgradeModalContext";

// BPMN.js imports
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

const DEFAULT_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:oop="http://schema.org/oop"
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Tarea 1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Fin">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="185" y="142" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="441" y="142" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnEditorPage = () => {
  const { diagramId } = useParams();
  const navigate = useNavigate();
  const { handleResponse: handleUpgradeResponse } = useUpgradeModal();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const containerRef = useRef(null);
  const modelerRef = useRef(null);

  // State
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [versions, setVersions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [comments, setComments] = useState([]);
  const [oopClasses, setOOPClasses] = useState([]);
  const [components, setComponents] = useState([]);
  // Notifications + unread-count moved to useEditorNotifications hook
  const { notifications, unreadCount, refresh: refetchNotifications } = useEditorNotifications();
  const [moscowElements, setMoscowElements] = useState({}); // {element_id: {highest_moscow, count, requirement_codes[]}}
  const [moscowLinks, setMoscowLinks] = useState([]); // raw link records [{id, element_id, requirement{}, spec_id}]
  const [orphansDialogOpen, setOrphansDialogOpen] = useState(false);
  const [remapTarget, setRemapTarget] = useState(null); // {id, element_id, requirement} when remapping
  const [moscowVisible, setMoscowVisible] = useState(() => {
    try { return localStorage.getItem("moscow_visible") !== "false"; } catch { return true; }
  });
  const [moscowOverlayCollapsed, setMoscowOverlayCollapsed] = useState(() => {
    try { return localStorage.getItem("moscow_overlay_collapsed") === "true"; } catch { return false; }
  });
  const [totalLinkableElements, setTotalLinkableElements] = useState(0);
  const [presentElementIds, setPresentElementIds] = useState(new Set());

  // UI State
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("properties");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [codeAnalyzerOpen, setCodeAnalyzerOpen] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  // Version tree + diff state
  const [versionTree, setVersionTree] = useState(null);
  // Version-diff sub-state moved to useVersionDiff hook
  const {
    diffDialogOpen, setDiffDialogOpen,
    diffData,
    diffVersionA, setDiffVersionA,
    diffVersionB, setDiffVersionB,
    loadingDiff,
    fetchDiff: fetchDiffRaw,
  } = useVersionDiff();
  const [historyTab, setHistoryTab] = useState("tree"); // tree, list
  const [commitMessage, setCommitMessage] = useState("");
  const [versionTags, setVersionTags] = useState([]);
  const [aiPrompt, setAIPrompt] = useState("");
  const [codeToAnalyze, setCodeToAnalyze] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [newBranchName, setNewBranchName] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  // Inline AI suggestions state
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(() => {
    try { return localStorage.getItem("ai_suggestions_enabled") !== "false"; } catch { return true; }
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsPos, setAiSuggestionsPos] = useState(null);
  const [aiSelectedElement, setAiSelectedElement] = useState(null);
  const suggestTimerRef = useRef(null);
  const aiSuggestAbortRef = useRef(null);
  const [currentBranch, setCurrentBranch] = useState(null);
  
  // Merge state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergePreview, setMergePreview] = useState(null);
  const [mergeResolutions, setMergeResolutions] = useState({});
  
  // Git state
  const [gitDialogOpen, setGitDialogOpen] = useState(false);
  const [gitRepos, setGitRepos] = useState([]);
  const [newGitRepo, setNewGitRepo] = useState({ name: "", repository_url: "", access_token: "", sync_path: "bpmn/" });

  // P2 features state
  const [validationOpen, setValidationOpen] = useState(false);
  const [umlOpen, setUmlOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Summary/Prompt Generation
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [editorSummaryStep, setEditorSummaryStep] = useState("config");
  const [generatingSummaryEditor, setGeneratingSummaryEditor] = useState(false);
  const [editorSummary, setEditorSummary] = useState("");
  const [editorSummaryContext, setEditorSummaryContext] = useState("");
  const [editorSummaryIncludeXml, setEditorSummaryIncludeXml] = useState(true);
  const [editorSummaryIncludeOop, setEditorSummaryIncludeOop] = useState(true);
  const [copiedEditorSummary, setCopiedEditorSummary] = useState(false);
  // LLM Processing State (editor)
  const [editorLlmProvider, setEditorLlmProvider] = useState("deepseek");
  const [editorLlmOutputType, setEditorLlmOutputType] = useState("code");
  const [editorLlmLanguage, setEditorLlmLanguage] = useState("sudolang");
  const [editorLlmResult, setEditorLlmResult] = useState("");
  const [editorProcessingLlm, setEditorProcessingLlm] = useState(false);
  const [copiedEditorLlmResult, setCopiedEditorLlmResult] = useState(false);
  const [editorOpencodeModel, setEditorOpencodeModel] = useState("");

  // Realtime collaboration (presence, cursors, locks, broadcast) — useCollaboration hook
  const {
    collaborators,
    lockedElements,
    handleCanvasMouseMove,
    handleElementLock,
    handleElementUnlock,
    broadcastChange,
  } = useCollaboration(modelerRef, containerRef, diagramId);

  // Input/Output data mapping per element — managed by useElementIO hook below
  const {
    elementDataMap,
    setElementData,
    parseElementDataFromXml,
    saveElementDataToXml,
    showOverlays,
    setShowOverlays,
  } = useElementIO(modelerRef, setHasChanges);

  // Initialize BPMN Modeler - handles React 19 StrictMode double-mount
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    // Create a dedicated div for this modeler instance
    const modelerDiv = document.createElement('div');
    modelerDiv.style.width = '100%';
    modelerDiv.style.height = '100%';
    container.appendChild(modelerDiv);

    const modeler = new BpmnModeler({
      container: modelerDiv,
      keyboard: { bindTo: document }
    });

    modelerRef.current = modeler;

    // Event listeners - selection and collaboration
    let prevSelectedId = null;
    modeler.on("element.click", (e) => {
      if (cancelled) return;

      // Remap mode: the user activated "Re-asignar" on an orphan link from
      // the dialog. The next click on a real shape should re-target the link.
      const rt = remapTargetRef.current;
      if (rt) {
        // Skip clicks on the canvas background
        const elType = e.element?.type;
        if (elType === "bpmn:Process" || elType === "bpmn:Collaboration") return;
        // Don't allow remapping to the same element_id (PATCH would no-op anyway)
        const newElementId = e.element.id;
        (async () => {
          try {
            const res = await fetch(`${API}/specs/element-links/${rt.id}`, {
              method: "PATCH",
              headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
              body: JSON.stringify({ element_id: newElementId }),
            });
            if (res.ok) {
              const code = rt.requirement?.code || "link";
              toast.success(`${code} re-asignado a ${newElementId}`);
              fetchMoscowAggregates();
            } else if (res.status === 409) {
              toast.error("Ya existe un link a ese elemento con el mismo requirement.");
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.detail || `Error ${res.status} al re-asignar`);
            }
          } catch (err) {
            toast.error(`Error de red: ${err.message || err}`);
          } finally {
            setRemapTarget(null);
          }
        })();
        return; // suppress the rest of the click handler in remap mode
      }

      // Unlock previous, lock new
      if (prevSelectedId && prevSelectedId !== e.element.id) {
        handleElementUnlock(prevSelectedId);
      }
      if (e.element.type !== "bpmn:Process" && e.element.type !== "bpmn:Collaboration") {
        handleElementLock(e.element.id);
      }
      prevSelectedId = e.element.id;
      setSelectedElement(e.element);

      // Trigger inline AI suggestions
      if (aiSuggestionsEnabled && e.element.type !== "bpmn:Process" && e.element.type !== "bpmn:Collaboration") {
        triggerAiSuggestions(e.element);
      }

      // Auto-open the Requirements panel when clicking an element with linked
      // requirements (issue e). Skips bpmn:Process/Collaboration (background
      // clicks) and only nudges once per session to avoid hijacking the user.
      try {
        const linked = moscowElementsRef.current?.[e.element.id];
        if (
          linked &&
          (linked.requirement_codes || []).length > 0 &&
          e.element.type !== "bpmn:Process" &&
          e.element.type !== "bpmn:Collaboration"
        ) {
          setRightPanelOpen(true);
          setRightPanelTab("requirements");
        }
      } catch (_err) { /* noop */ }
    });

    modeler.on("commandStack.changed", () => {
      if (!cancelled) {
        setHasChanges(true);
        broadcastChange();
      }
    });

    // Warn when deleting an element with linked requirements (issue: orphaned
    // requirements). Captures the link snapshot in preExecute, surfaces a
    // toast in postExecute. Toast offers "Deshacer" to roll back the deletion
    // and "Migrar" to open the Requirements panel scoped to the lost links.
    const pendingDeletes = new Map(); // shapeId -> {priority, codes[], spec_id?}
    modeler.on("commandStack.shape.delete.preExecute", (event) => {
      try {
        const shape = event?.context?.shape;
        if (!shape || !shape.id) return;
        const linked = moscowElementsRef.current?.[shape.id];
        const codes = (linked?.requirement_codes) || [];
        if (codes.length === 0) return;
        pendingDeletes.set(shape.id, {
          priority: linked.highest_moscow,
          codes: [...codes],
        });
      } catch (_err) { /* noop */ }
    });
    modeler.on("commandStack.shape.delete.postExecuted", (event) => {
      try {
        const shape = event?.context?.shape;
        if (!shape || !shape.id) return;
        const captured = pendingDeletes.get(shape.id);
        pendingDeletes.delete(shape.id);
        if (!captured) return;
        const { priority, codes } = captured;
        const isCritical = priority === "must" || priority === "should";
        const summary = `${codes.length} requirement${codes.length === 1 ? "" : "s"} (${(priority || "").toUpperCase()})`;
        const codesPreview = codes.slice(0, 4).join(", ") + (codes.length > 4 ? `, +${codes.length - 4}` : "");
        const action = {
          label: "Deshacer",
          onClick: () => {
            try { modeler.get("commandStack").undo(); } catch (_e) { /* noop */ }
          },
        };
        const message = `Has eliminado un elemento con ${summary} enlazados: ${codesPreview}`;
        if (isCritical) {
          toast.error(message, { duration: 12000, action });
        } else {
          toast.warning(message, { duration: 8000, action });
        }
        // The links remain in the DB pointing to a now-missing element_id.
        // Refresh aggregates so the canvas overlay coverage reflects the loss.
        setTimeout(() => { try { fetchMoscowAggregates(); } catch (_e) { /* noop */ } }, 400);
      } catch (_err) { /* noop */ }
    });

    // Safe importXML - catches bpmn-js internal errors
    const safeImport = async (xml) => {
      if (cancelled) return false;
      try {
        await modeler.importXML(xml);
        if (cancelled) return false;
        try { modeler.get("canvas").zoom("fit-viewport"); } catch (_err) { /* canvas op */ }
        parseElementDataFromXml(modeler);
        return true;
      } catch (err) {
        console.warn("importXML failed, trying default:", err.message);
        if (cancelled || xml === DEFAULT_BPMN) return false;
        try {
          await modeler.importXML(DEFAULT_BPMN);
          if (cancelled) return false;
          try { modeler.get("canvas").zoom("fit-viewport"); } catch (_err) { /* canvas op */ }
          return true;
        } catch (fallbackErr) {
          console.warn("Default BPMN import also failed:", fallbackErr.message);
          return false;
        }
      }
    };

    // Load diagram after modeler is ready
    const initDiagram = async () => {
      try {
        if (diagramId) {
          const response = await fetch(`${API}/diagrams/${diagramId}`, {
            headers: getAuthHeaders()
          });
          if (cancelled) return;

          if (response.ok) {
            const data = await response.json();
            if (cancelled) return;
            setDiagram(data);
            
            const xmlContent = data.current_xml || '';
            const isValidBpmn = xmlContent.length > 50 &&
              (xmlContent.includes('bpmn:definitions') || xmlContent.includes('<definitions'));
            
            if (isValidBpmn) {
              const ok = await safeImport(xmlContent);
              if (!ok && !cancelled) {
                toast.warning(t("editor.xml_warning"));
                setHasChanges(true);
              }
            } else {
              if (!cancelled) {
                toast.info(t("editor.invalid_bpmn"));
                await safeImport(DEFAULT_BPMN);
                setHasChanges(true);
              }
            }
            
            if (!cancelled) {
              fetchVersions();
              fetchBranches();
              fetchComments();
            }
          } else {
            if (!cancelled) {
              toast.error(t("editor.not_found"));
              navigate("/library");
            }
            return;
          }
        } else {
          await safeImport(DEFAULT_BPMN);
        }
      } catch (error) {
        console.error("Error in initDiagram:", error);
        if (!cancelled) {
          toast.error(t("editor.net_error"));
          await safeImport(DEFAULT_BPMN);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initDiagram();

    return () => {
      cancelled = true;
      modelerRef.current = null;
      try { modeler.destroy(); } catch (_err) { /* canvas op */ }
      if (container.contains(modelerDiv)) {
        container.removeChild(modelerDiv);
      }
    };
  }, [diagramId]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket collaboration, cursor + lock rendering: see `useCollaboration` hook above.

  // Track latest moscowElements for the click-to-open-panel behavior (issue e).
  // Using a ref because the bpmn-js listener is registered once and would
  // otherwise capture a stale closure of moscowElements.
  const moscowElementsRef = React.useRef(moscowElements);
  useEffect(() => { moscowElementsRef.current = moscowElements; }, [moscowElements]);

  // Same pattern for the active remap target — the bpmn-js listener captures
  // the value at time of registration, so we mirror it into a ref.
  const remapTargetRef = React.useRef(remapTarget);
  useEffect(() => { remapTargetRef.current = remapTarget; }, [remapTarget]);

  // Callback used by LinkedRequirementsWidget after (un)link operations
  const applyMoscowMarkers = useCallback((aggregates) => {
    setMoscowElements(aggregates || {});
  }, []);

  // Apply MoSCoW markers + code badges to the BPMN canvas.
  // Re-runs when moscowElements OR moscowVisible changes. Also re-binds on
  // every modeler 'import.done' to handle the race-condition where aggregates
  // arrive before the XML model is fully imported.
  const paintMoscowMarkers = useCallback(() => {
    if (!modelerRef.current) return;
    let canvas, registry, overlays;
    try {
      canvas = modelerRef.current.get("canvas");
      registry = modelerRef.current.get("elementRegistry");
      overlays = modelerRef.current.get("overlays");
    } catch (_err) { return; }

    const classes = ["moscow-must", "moscow-should", "moscow-could", "moscow-wont"];
    try { registry.getAll().forEach((el) => classes.forEach((c) => canvas.removeMarker(el.id, c))); } catch (_err) { /* noop */ }
    try { overlays.remove({ type: "moscow-badge" }); } catch (_err) { /* noop */ }

    // Update total linkable elements (tasks/events/gateways/subprocesses) for coverage stats.
    try {
      const all = registry.getAll();
      const linkable = all.filter((el) => {
        const t = el.type || "";
        if (t.startsWith("bpmn:Task") || t === "bpmn:Task") return true;
        if (t.includes("Activity") || t.includes("SubProcess")) return true;
        if (t.includes("Event")) return true;
        if (t.includes("Gateway")) return true;
        return false;
      });
      setTotalLinkableElements(linkable.length);
      setPresentElementIds(new Set(all.map((el) => el.id)));
    } catch (_err) { /* canvas op */ }

    if (!moscowVisible) return; // Toggle off → just clear and bail.

    Object.entries(moscowElements).forEach(([elementId, info]) => {
      const el = registry.get(elementId);
      if (!el) return;
      const cls = `moscow-${info.highest_moscow}`;
      try { canvas.addMarker(elementId, cls); } catch (_err) { /* noop */ }

      const codes = info.requirement_codes || [];
      const label = codes.length === 1 ? codes[0] : `×${codes.length}`;
      const html = document.createElement("div");
      html.className = `moscow-badge ${info.highest_moscow}`;
      html.textContent = label;
      // Tooltip: full list of requirement codes + count (issue f).
      const tooltipLines = [
        `${(info.highest_moscow || "").toUpperCase()} · ${codes.length} requirement${codes.length === 1 ? "" : "s"}`,
        ...codes.map((c) => `· ${c}`),
      ];
      html.title = tooltipLines.join("\n");
      try {
        overlays.add(elementId, "moscow-badge", { position: { top: 0, left: 0 }, html });
      } catch (_err) { /* noop */ }
    });
  }, [moscowElements, moscowVisible]);

  // Trigger paint on data/visibility changes
  useEffect(() => {
    paintMoscowMarkers();
  }, [paintMoscowMarkers]);

  // Re-paint after every BPMN XML import (handles race-condition: aggregates
  // could arrive before elements were registered in the canvas). Also
  // re-fetches aggregates once after import to recover from transient auth
  // hiccups that may have caused the initial fetch to silently fail.
  useEffect(() => {
    if (!modelerRef.current) return;
    const modeler = modelerRef.current;
    const onImportDone = () => {
      paintMoscowMarkers();
      // Recovery: if aggregates are empty (or fetch failed earlier), retry now
      // that the modeler is fully ready and any auth state has settled.
      if (Object.keys(moscowElementsRef.current || {}).length === 0) {
        try { fetchMoscowAggregates(); } catch (_err) { /* noop */ }
      }
    };
    try { modeler.on("import.done", onImportDone); } catch (_err) { /* noop */ }
    return () => {
      try { modeler.off("import.done", onImportDone); } catch (_err) { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintMoscowMarkers]);

  // ESC cancels the active remap mode.
  useEffect(() => {
    if (!remapTarget) return;
    const handler = (e) => {
      if (e.key === "Escape") setRemapTarget(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [remapTarget]);

  // Persist toggles
  useEffect(() => {
    try { localStorage.setItem("moscow_visible", String(moscowVisible)); } catch { /* ignore */ }
  }, [moscowVisible]);
  useEffect(() => {
    try { localStorage.setItem("moscow_overlay_collapsed", String(moscowOverlayCollapsed)); } catch { /* ignore */ }
  }, [moscowOverlayCollapsed]);

  // Keyboard shortcuts — see `useEditorShortcuts` hook. Handlers reference
  // `saveDiagram`, `fetchVersionTree`, `fetchGitRepos`, `exportDiagram` which
  // are declared further down; the hook captures them via a ref so referring
  // to them before they exist in the render scope is safe (event listener
  // reads the latest ref on every keypress).
  useEditorShortcuts({
    diagramId,
    isAuthenticated,
    onSave: () => {
      if (diagramId) setSaveDialogOpen(true);
      else saveDiagram();
    },
    onValidate: () => setValidationOpen(true),
    onSimulator: () => setSimulatorOpen(true),
    onUml: () => setUmlOpen(true),
    onDocs: () => setDocsOpen(true),
    onAnalytics: () => setAnalyticsOpen(true),
    onHistory: () => { setHistoryOpen(true); fetchVersionTree(); },
    onBranches: () => setBranchDialogOpen(true),
    onGit: () => { setGitDialogOpen(true); fetchGitRepos(); },
    onAi: () => setAIDialogOpen(true),
    onExport: () => exportDiagram("xml"),
    onToggleShortcuts: () => setShortcutsOpen((prev) => !prev),
  });

  const loadDiagram = async (xml) => {
    if (!modelerRef.current) {
      console.error("Modeler not initialized");
      return false;
    }
    try {
      await modelerRef.current.importXML(xml);
      try { modelerRef.current.get("canvas").zoom("fit-viewport"); } catch (_err) { /* canvas op */ }
      return true;
    } catch (err) {
      console.warn("loadDiagram failed, trying default:", err.message);
      try {
        await modelerRef.current.importXML(DEFAULT_BPMN);
        try { modelerRef.current.get("canvas").zoom("fit-viewport"); } catch (_err) { /* canvas op */ }
        toast.warning(t("editor.xml_restore"));
        return true;
      } catch (_fallback) {
        console.warn("Diagram load fallback failed:", _fallback);
        toast.error("Error al cargar el diagrama");
        return false;
      }
    }
  };

  const fetchDiagram = async () => {
    try {
      const response = await fetch(`${API}/diagrams/${diagramId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setDiagram(data);
        await loadDiagram(data.current_xml);
        fetchVersions();
        fetchBranches();
        fetchComments();
        fetchGitRepos();
        fetchMoscowAggregates();
      } else {
        toast.error("Diagrama no encontrado");
        navigate("/library");
      }
    } catch (error) {
      console.error("Error fetching diagram:", error);
      toast.error("Error al cargar el diagrama");
    } finally {
      setLoading(false);
    }
  };

  const fetchMoscowAggregates = async () => {
    if (!diagramId) return;
    try {
      const res = await fetch(`${API}/specs/element-links?diagram_id=${diagramId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMoscowElements(data.elements || {});
        setMoscowLinks(data.links || []);
      }
    } catch (_err) { /* silent */ }
  };

  const fetchGitRepos = async () => {
    try {
      const response = await fetch(`${API}/git-repos`, { headers: getAuthHeaders() });
      if (response.ok) setGitRepos(await response.json());
    } catch (_err) { /* canvas op */ }
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch(`${API}/diagrams/${diagramId}/versions`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setVersions(await response.json());
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  };

  const fetchVersionTree = async () => {
    try {
      const response = await fetch(`${API}/diagrams/${diagramId}/versions/tree`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setVersionTree(await response.json());
      }
    } catch (error) {
      console.error("Error fetching version tree:", error);
    }
  };

  // fetchDiff now wraps the hook's fetcher with the current diagramId
  const fetchDiff = (v1, v2) => fetchDiffRaw(diagramId, v1, v2);

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API}/diagrams/${diagramId}/branches`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setBranches(await response.json());
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API}/diagrams/${diagramId}/comments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setComments(await response.json());
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchOOPClasses = async () => {
    try {
      const response = await fetch(`${API}/oop-classes`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setOOPClasses(await response.json());
      }
    } catch (error) {
      console.error("Error fetching OOP classes:", error);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${API}/components`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setComponents(await response.json());
      }
    } catch (error) {
      console.error("Error fetching components:", error);
    }
  };

  const fetchNotifications = refetchNotifications;

  useEffect(() => {
    fetchOOPClasses();
    fetchComponents();
    // notifications already fetched on mount by useEditorNotifications
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getXML = async () => {
    if (!modelerRef.current) throw new Error("Modeler not initialized");
    const { xml } = await modelerRef.current.saveXML({ format: true });
    return xml;
  };

  const saveDiagram = async () => {
    try {
      setSaving(true);
      // Inject I/O data into XML before saving
      saveElementDataToXml();
      const xml = await getXML();

      if (diagramId) {
        // Update existing diagram
        await fetch(`${API}/diagrams/${diagramId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ current_xml: xml })
        });
        
        // Create version
        await fetch(`${API}/diagrams/${diagramId}/versions`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            commit_message: commitMessage || "Actualización",
            tags: versionTags
          })
        });

        toast.success(t("editor.diagram_saved"));
        setHasChanges(false);
        fetchVersions();

        // Auto-push to connected Git repos
        if (gitRepos.length > 0) {
          for (const repo of gitRepos) {
            try {
              const pushResp = await fetch(`${API}/git-repos/${repo.id}/push`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ diagram_id: diagramId })
              });
              if (pushResp.ok) {
                const pushData = await pushResp.json();
                toast.success(`Git sync: ${pushData.file_path}`);
              }
            } catch (gitErr) {
              console.warn("Auto-push failed for repo:", repo.name, gitErr);
            }
          }
          fetchGitRepos();
        }
      } else {
        // Create new diagram
        const name = prompt("Nombre del diagrama:", "Nuevo Diagrama");
        if (!name) return;

        const response = await fetch(`${API}/diagrams`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name,
            description: "",
            current_xml: xml,
            tags: []
          })
        });

        if (response.ok) {
          const newDiagram = await response.json();
          toast.success(t("editor.diagram_created"));
          navigate(`/editor/${newDiagram.id}`);
        } else {
          let parsed = null;
          try { parsed = await response.json(); } catch {}
          const handled = await handleUpgradeResponse({
            status: response.status,
            data: parsed,
            type: "diagrams",
            message: "Has alcanzado el limite del plan Free. Sube a Pro para diagramas ilimitados.",
            upgrade_url: "/pricing#pro",
          });
          if (!handled) toast.error(t("editor.save_error"));
        }
      }
    } catch (error) {
      console.error("Error saving diagram:", error);
      toast.error(t("editor.save_error"));
    } finally {
      setSaving(false);
      setSaveDialogOpen(false);
      setCommitMessage("");
      setVersionTags([]);
    }
  };

  const exportDiagram = async (format) => {
    try {
      if (format === "xml") {
        const xml = await getXML();
        downloadBlob(
          new Blob([xml], { type: "application/xml" }),
          `${diagram?.name || "diagram"}.bpmn`,
        );
      } else if (format === "svg") {
        const { svg } = await modelerRef.current.saveSVG();
        downloadBlob(
          new Blob([svg], { type: "image/svg+xml" }),
          `${diagram?.name || "diagram"}.svg`,
        );
      }
      toast.success(t("editor.exported"));
    } catch (error) {
      toast.error(t("editor.export_error"));
    }
  };

  const importDiagram = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await loadDiagram(e.target.result);
        setHasChanges(true);
        toast.success(t("editor.imported"));
      } catch (error) {
        toast.error(t("editor.import_error"));
      }
    };
    reader.readAsText(file);
  };

  // --- Inline AI Suggestions ---
  const triggerAiSuggestions = (element) => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    setAiSelectedElement(element);

    // Position the popover near the element
    try {
      const modeler = modelerRef.current;
      if (modeler) {
        const canvas = modeler.get("canvas");
        const viewbox = canvas.viewbox();
        const elGfx = modeler.get("elementRegistry").getGraphics(element);
        if (elGfx) {
          const bbox = elGfx.getBBox();
          // Convert diagram coords to screen coords
          const screenX = (bbox.x + bbox.width - viewbox.x) * viewbox.scale + 20;
          const screenY = (bbox.y - viewbox.y) * viewbox.scale;
          setAiSuggestionsPos({ x: screenX, y: screenY });
        }
      }
    } catch (_err) { /* noop */ }

    suggestTimerRef.current = setTimeout(async () => {
      // Abort previous request
      if (aiSuggestAbortRef.current) aiSuggestAbortRef.current.abort();
      const controller = new AbortController();
      aiSuggestAbortRef.current = controller;

      setAiSuggestionsLoading(true);
      try {
        const modeler = modelerRef.current;
        if (!modeler) return;
        const xml = await new Promise((resolve) => {
          modeler.saveXML({ format: true }).then(({ xml }) => resolve(xml)).catch(() => resolve(""));
        });
        if (!xml) return;

        const res = await fetch(`${API}/ai/suggest`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            diagram_xml: xml,
            selected_element_id: element.id,
            selected_element_type: element.type,
          }),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setAiSuggestions(data.suggestions || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setAiSuggestions([]);
        }
      } finally {
        setAiSuggestionsLoading(false);
      }
    }, 600);
  };

  const dismissAiSuggestions = () => {
    setAiSuggestions([]);
    setAiSuggestionsPos(null);
    setAiSelectedElement(null);
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
  };

  const applyAiSuggestion = async (suggestion) => {
    const element = aiSelectedElement;
    if (!element) return;
    dismissAiSuggestions();

    try {
      setGeneratingAI(true);
      const modeler = modelerRef.current;
      if (!modeler) return;
      const { xml: currentXml } = await modeler.saveXML({ format: true });

      const res = await fetch(`${API}/ai/apply-suggestion`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          diagram_xml: currentXml,
          selected_element_id: element.id,
          action: suggestion.action,
          label: suggestion.label,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadDiagram(data.xml);
        setHasChanges(true);
        toast.success(t("editor.ai_suggest.applied") || "Sugerencia aplicada");
      } else {
        toast.error(t("editor.ai_error"));
      }
    } catch (_err) {
      toast.error(t("editor.ai_error"));
    } finally {
      setGeneratingAI(false);
    }
  };

  const toggleAiSuggestions = () => {
    const next = !aiSuggestionsEnabled;
    setAiSuggestionsEnabled(next);
    try { localStorage.setItem("ai_suggestions_enabled", String(next)); } catch { /* noop */ }
    if (!next) dismissAiSuggestions();
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      setGeneratingAI(true);
      const response = await fetch(`${API}/ai/generate-bpmn`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (response.ok) {
        const data = await response.json();
        await loadDiagram(data.xml);
        setHasChanges(true);
        toast.success(t("editor.ai_generated"));
        setAIDialogOpen(false);
        setAIPrompt("");
      } else {
        toast.error(t("editor.ai_error"));
      }
    } catch (error) {
      toast.error("Error al generar diagrama");
    } finally {
      setGeneratingAI(false);
    }
  };

  const analyzeCode = async () => {
    if (!codeToAnalyze.trim()) return;

    try {
      setGeneratingAI(true);
      const response = await fetch(`${API}/ai/analyze-code`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: codeToAnalyze, language: codeLanguage })
      });

      if (response.ok) {
        const data = await response.json();
        await loadDiagram(data.xml);
        setHasChanges(true);
        toast.success(t("editor.code_analyzed"));
        setCodeAnalyzerOpen(false);
        setCodeToAnalyze("");
      } else {
        toast.error(t("editor.code_error"));
      }
    } catch (error) {
      toast.error("Error al analizar código");
    } finally {
      setGeneratingAI(false);
    }
  };

  const openSummaryEditor = () => {
    setEditorSummaryStep("config");
    setEditorSummaryContext("");
    setEditorSummary("");
    setEditorSummaryIncludeXml(true);
    setEditorSummaryIncludeOop(true);
    setCopiedEditorSummary(false);
    setEditorLlmProvider("deepseek");
    setEditorLlmOutputType("code");
    setEditorLlmLanguage("sudolang");
    setEditorLlmResult("");
    setCopiedEditorLlmResult(false);
    setSummaryDialogOpen(true);
  };

  const handleGenerateSummaryEditor = async () => {
    if (!diagramId) return;
    setGeneratingSummaryEditor(true);
    setEditorSummary("");
    try {
      const res = await fetch(`${API}/ai/diagrams/${diagramId}/generate-summary`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          include_xml: editorSummaryIncludeXml,
          include_oop: editorSummaryIncludeOop,
          custom_context: editorSummaryContext || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEditorSummary(data.summary);
        setEditorSummaryStep("prompt");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al generar resumen");
      }
    } catch (err) {
      toast.error("Error de red al generar resumen");
    } finally {
      setGeneratingSummaryEditor(false);
    }
  };

  const handleEditorProcessWithLlm = async () => {
    setEditorProcessingLlm(true);
    setEditorLlmResult("");
    try {
      const body = {
          prompt: editorSummary,
          llm_provider: editorLlmProvider,
          output_type: editorLlmOutputType,
          language: editorLlmLanguage,
      };
      if ((editorLlmProvider === "opencode" || editorLlmProvider === "opencode-go") && editorOpencodeModel) {
        body.model = editorOpencodeModel;
      }
      const res = await fetch(`${API}/ai/process-prompt`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setEditorLlmResult(data.content);
        setEditorSummaryStep("result");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al procesar con IA");
      }
    } catch (err) {
      toast.error("Error de red al procesar con IA");
    } finally {
      setEditorProcessingLlm(false);
    }
  };

  const copyEditorSummary = () => {
    navigator.clipboard.writeText(editorSummary);
    setCopiedEditorSummary(true);
    setTimeout(() => setCopiedEditorSummary(false), 2000);
    toast.success(t("proj.copied"));
  };

  const copyEditorLlmResult = () => {
    navigator.clipboard.writeText(editorLlmResult);
    setCopiedEditorLlmResult(true);
    setTimeout(() => setCopiedEditorLlmResult(false), 2000);
    toast.success(t("proj.copied"));
  };

  const downloadEditorSummary = () => {
    downloadText(
      editorSummary,
      `${diagram?.name?.replace(/\s+/g, "_") || "diagrama"}_prompt.md`,
      "text/markdown",
    );
  };

  const EDITOR_LANG_EXT = { sudolang: "sudo", python: "py", nodejs: "ts", java: "java", csharp: "cs", go: "go" };

  const downloadEditorLlmResult = () => {
    const ext = editorLlmOutputType === "code" ? (EDITOR_LANG_EXT[editorLlmLanguage] || "txt") : "md";
    downloadText(
      editorLlmResult,
      `${diagram?.name?.replace(/\s+/g, "_") || "diagrama"}_${editorLlmOutputType}.${ext}`,
    );
  };

  const createBranch = async () => {
    if (!newBranchName.trim() || !diagramId) return;

    try {
      const response = await fetch(`${API}/diagrams/${diagramId}/branches`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newBranchName })
      });

      if (response.ok) {
        toast.success(t("editor.branch_create"));
        fetchBranches();
        setBranchDialogOpen(false);
        setNewBranchName("");
      }
    } catch (error) {
      toast.error("Error al crear rama");
    }
  };

  const handlePreviewMerge = async (branch) => {
    try {
      const resp = await fetch(`${API}/branches/${branch.id}/preview-merge`, {
        method: "POST", headers: getAuthHeaders()
      });
      const data = await resp.json();
      setMergePreview({ ...data, branchId: branch.id, branchName: branch.name });
      setMergeDialogOpen(true);
    } catch (err) {
      toast.error("Error al previsualizar merge");
    }
  };

  const handleConfirmMerge = async () => {
    if (!mergePreview) return;
    try {
      const useXml = mergePreview.has_conflicts ? mergePreview.branch_xml : undefined;
      const resp = await fetch(`${API}/branches/${mergePreview.branchId}/merge`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ resolved_xml: useXml })
      });
      if (resp.ok) {
        toast.success(t("editor.merge_complete"));
        setMergeDialogOpen(false);
        setBranchDialogOpen(false);
        window.location.reload();
      } else {
        toast.error(t("editor.merge_error"));
      }
    } catch (err) {
      toast.error("Error al hacer merge");
    }
  };

  const revertToVersion = async (versionNumber) => {
    try {
      await fetch(`${API}/diagrams/${diagramId}/revert/${versionNumber}`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      toast.success(`Revertido a versión ${versionNumber}`);
      fetchDiagram();
    } catch (error) {
      toast.error("Error al revertir");
    }
  };

  const addComment = async () => {
    if (!newCommentContent.trim() || !selectedElement || !diagramId) return;

    try {
      await fetch(`${API}/diagrams/${diagramId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          element_id: selectedElement.id,
          element_name: selectedElement.businessObject?.name || selectedElement.id,
          content: newCommentContent,
          mentions: []
        })
      });
      toast.success(t("editor.comment_added"));
      fetchComments();
      setNewCommentContent("");
    } catch (error) {
      toast.error(t("editor.comment_error"));
    }
  };

  const handleZoom = (direction) => {
    if (!modelerRef.current) return;
    try {
      const canvas = modelerRef.current.get("canvas");
      const currentZoom = canvas.zoom();
      const newZoom = direction === "in" ? currentZoom * 1.2 : currentZoom / 1.2;
      canvas.zoom(newZoom);
    } catch (e) { /* modeler might not be ready */ }
  };

  const fitToViewport = () => {
    if (!modelerRef.current) return;
    try {
      const canvas = modelerRef.current.get("canvas");
      canvas.zoom("fit-viewport");
    } catch (e) { /* modeler might not be ready */ }
  };

  const elementComments = comments.filter(c => c.element_id === selectedElement?.id);

  const ShortcutRow = ({ keys, action }) => (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-zinc-500">{action}</span>
      <div className="flex items-center gap-0.5">
        {keys.split("+").map((k, i) => (
          <React.Fragment key={`${k}-${i}`}>
            {i > 0 && <span className="text-zinc-300 mx-0.5">+</span>}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {k}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background" data-testid="bpmn-editor-page">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Cargando editor...</span>
            </div>
          </div>
        )}
        {/* Toolbar */}
        <header className="h-12 border-b border-zinc-200 bg-white flex items-center px-3 gap-1.5" data-testid="editor-toolbar">
          {/* Back + Name */}
          <Link to="/library" className="mr-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 mr-2">
            <div className="w-6 h-6 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <Workflow className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 truncate max-w-40" style={{ fontFamily: "'Chivo', sans-serif" }}>
              {diagram?.name || t("editor.new_diagram")}
            </span>
            {hasChanges && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t("editor.edited")}</span>}
          </div>

          <div className="toolbar-divider" />

          {/* Segment: Archivo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-medium px-2.5" data-testid="file-menu-btn">
                <FileCode className="w-3.5 h-3.5 mr-1.5" />
                {t("editor.file")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-lg">
              <DropdownMenuItem onClick={() => navigate("/editor")} className="rounded-lg text-xs">
                <Plus className="w-3.5 h-3.5 mr-2" /> {t("editor.new")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-xs">
                <label className="cursor-pointer">
                  <Upload className="w-3.5 h-3.5 mr-2" /> {t("editor.import")}
                  <input type="file" accept=".bpmn,.xml" onChange={importDiagram} className="hidden" />
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportDiagram("xml")} className="rounded-lg text-xs">
                <Download className="w-3.5 h-3.5 mr-2" /> {t("editor.export_bpmn")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportDiagram("svg")} className="rounded-lg text-xs">
                <Download className="w-3.5 h-3.5 mr-2" /> {t("editor.export_svg")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Segment: IA */}
          <div className="flex items-center border border-zinc-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setAIDialogOpen(true)} disabled={!isAuthenticated}
                  className="h-8 rounded-lg text-xs font-medium px-2.5 border-r border-zinc-200" data-testid="ai-generate-btn">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> {t("editor.ai")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAuthenticated ? t("editor.ai_generate") : t("editor.ai_login")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setCodeAnalyzerOpen(true)} disabled={!isAuthenticated}
                  className="h-8 rounded-lg text-xs font-medium px-2.5 border-r border-zinc-200" data-testid="code-analyzer-btn">
                  <Terminal className="w-3.5 h-3.5 mr-1" /> {t("editor.code")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAuthenticated ? t("editor.analyze_code") : t("editor.login_required")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={aiSuggestionsEnabled ? "secondary" : "ghost"}
                  size="sm"
                  onClick={toggleAiSuggestions}
                  disabled={!isAuthenticated}
                  className="h-8 rounded-lg text-xs font-medium px-2.5 border-r border-zinc-200"
                  data-testid="ai-suggest-toggle"
                >
                  <Lightbulb className="w-3.5 h-3.5 mr-1" />
                  {t("editor.ai_suggest.toggle") || "IA"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {aiSuggestionsEnabled
                  ? (t("editor.ai_suggest.disable") || "Desactivar sugerencias IA")
                  : (t("editor.ai_suggest.enable") || "Activar sugerencias IA")}
              </TooltipContent>
            </Tooltip>
            {diagramId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={openSummaryEditor} disabled={!isAuthenticated}
                  className="h-8 rounded-lg text-xs font-medium px-2.5" data-testid="generate-prompt-editor-btn">
                  <FileText className="w-3.5 h-3.5 mr-1" /> {t("editor.prompt")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAuthenticated ? t("editor.gen_prompt") : t("editor.login_required")}</TooltipContent>
            </Tooltip>
            )}
          </div>

          {/* Segment: Herramientas (solo cuando hay diagrama) */}
          {diagramId && (
            <>
              <div className="toolbar-divider" />
              <div className="flex items-center border border-zinc-200" data-testid="tools-segment">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setValidationOpen(true)}
                      className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200" data-testid="validate-btn">
                      <Shield className="w-3.5 h-3.5 mr-1" /> {t("editor.validate")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("editor.validate")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSimulatorOpen(true)}
                      className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200" data-testid="simulator-btn">
                      <Play className="w-3.5 h-3.5 mr-1" /> {t("editor.simulate")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("editor.simulate_tooltip")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setUmlOpen(true)}
                      className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200" data-testid="uml-btn">
                      <Layers className="w-3.5 h-3.5 mr-1" /> {t("editor.uml")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("editor.uml_tooltip")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setDocsOpen(true)}
                      className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200" data-testid="docs-btn">
                      <FileText className="w-3.5 h-3.5 mr-1" /> {t("editor.docs")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("editor.docs_tooltip")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setAnalyticsOpen(true)}
                      className="h-8 rounded-lg text-xs font-medium px-2" data-testid="analytics-btn">
                      <BarChart3 className="w-3.5 h-3.5 mr-1" /> {t("editor.metrics")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("editor.analytics_tooltip")}</TooltipContent>
                </Tooltip>
              </div>
            </>
          )}

          <div className="toolbar-divider" />

          {/* Segment: Paneles */}
          <div className="flex items-center border border-zinc-200" data-testid="panels-segment">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanelTab === "comments" && rightPanelOpen ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200"
                  onClick={() => { setRightPanelTab("comments"); setRightPanelOpen(true); }}
                  data-testid="comments-panel-btn"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t("editor.chat")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("editor.comments")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanelTab === "oop" && rightPanelOpen ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200"
                  onClick={() => { setRightPanelTab("oop"); setRightPanelOpen(true); }}
                  data-testid="oop-panel-btn"
                >
                  <Code2 className="w-3.5 h-3.5 mr-1" /> {t("editor.oop")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("nav.oop_classes")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanelTab === "components" && rightPanelOpen ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200"
                  onClick={() => { setRightPanelTab("components"); setRightPanelOpen(true); }}
                  data-testid="components-panel-btn"
                >
                  <Puzzle className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("nav.components")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanelTab === "requirements" && rightPanelOpen ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-lg text-xs font-medium px-2"
                  onClick={() => { setRightPanelTab("requirements"); setRightPanelOpen(true); }}
                  data-testid="requirements-panel-btn"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Requirements</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1" />

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center gap-1 mr-2" data-testid="collaborators-section">
              {collaborators.slice(0, 3).map((collab) => (
                <Tooltip key={collab.id}>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: collab.color }}>
                      {collab.name.charAt(0)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{collab.name}</TooltipContent>
                </Tooltip>
              ))}
              {collaborators.length > 3 && (
                <span className="text-[10px] text-zinc-400 font-mono">+{collaborators.length - 3}</span>
              )}
            </div>
          )}

          {/* Segment: Version Control */}
          <div className="flex items-center border border-zinc-200" data-testid="vcs-segment">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => { setHistoryOpen(true); fetchVersionTree(); }}
                  className="h-8 rounded-lg text-xs font-medium px-2 border-r border-zinc-200" data-testid="history-btn">
                  <History className="w-3.5 h-3.5 mr-1" /> {t("editor.history")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("editor.version_tree_tooltip")}</TooltipContent>
            </Tooltip>
            {diagramId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setBranchDialogOpen(true)}
                    className={`h-8 rounded-lg text-xs font-medium px-2 ${diagramId && isAuthenticated ? 'border-r border-zinc-200' : ''}`} data-testid="branches-btn">
                    <GitBranch className="w-3.5 h-3.5 mr-1" /> {t("editor.branches")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("editor.branches_tooltip")}</TooltipContent>
              </Tooltip>
            )}
            {diagramId && isAuthenticated && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => { setGitDialogOpen(true); fetchGitRepos(); }}
                    className="h-8 rounded-lg text-xs font-medium px-2" data-testid="git-btn">
                    <Github className="w-3.5 h-3.5 mr-1" /> Git
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("editor.git_tooltip")}</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors ml-1" data-testid="editor-notifications-btn">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-lg">
              {notifications.length === 0 ? (
                <p className="p-3 text-xs text-zinc-400 text-center">{t("editor.no_notifications")}</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex-col items-start rounded-lg">
                    <span className="text-xs font-medium">{n.message}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{n.from_user}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="toolbar-divider" />

          {/* Shortcuts Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={shortcutsOpen ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShortcutsOpen(!shortcutsOpen)}
                className="h-8 w-8 rounded-lg text-xs font-bold p-0"
                data-testid="shortcuts-btn"
              >
                ?
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("editor.shortcuts")}</TooltipContent>
          </Tooltip>

          {/* Save */}
          {isAuthenticated ? (
          <Button
            onClick={() => diagramId ? setSaveDialogOpen(true) : saveDiagram()}
            disabled={saving}
            data-testid="save-diagram-btn"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 px-4 text-xs font-semibold"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {t("common.save")}
          </Button>
          ) : (
          <Button
            onClick={() => navigate("/login")}
            data-testid="login-to-edit-btn"
            variant="outline"
            size="sm"
            className="rounded-lg h-8 text-xs"
          >
            {t("editor.login_session")}
          </Button>
          )}
        </header>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* BPMN Canvas */}
          <div className="flex-1 relative">
            <div ref={containerRef} className="w-full h-full relative" data-testid="bpmn-canvas" onMouseMove={handleCanvasMouseMove} />

            {/* MoSCoW canvas overlay: legend + visibility toggle + coverage */}
            <MoscowCanvasOverlay
              moscowElements={moscowElements}
              totalElements={totalLinkableElements}
              visible={moscowVisible}
              onToggle={() => setMoscowVisible((v) => !v)}
              onRefresh={fetchMoscowAggregates}
              collapsed={moscowOverlayCollapsed}
              onToggleCollapsed={() => setMoscowOverlayCollapsed((v) => !v)}
              orphansCount={moscowLinks.filter((l) => !presentElementIds.has(l.element_id)).length}
              onOrphansClick={() => setOrphansDialogOpen(true)}
            />

            {/* Inline AI Suggestions popover */}
            {aiSuggestionsEnabled && isAuthenticated && (
              <AISuggestions
                suggestions={aiSuggestions}
                loading={aiSuggestionsLoading}
                position={aiSuggestionsPos}
                onApply={applyAiSuggestion}
                onDismiss={dismissAiSuggestions}
                t={t}
              />
            )}

            <OrphanedLinksDialog
              open={orphansDialogOpen}
              onOpenChange={setOrphansDialogOpen}
              orphans={moscowLinks.filter((l) => !presentElementIds.has(l.element_id))}
              apiBase={API}
              getAuthHeaders={getAuthHeaders}
              onDeleted={() => fetchMoscowAggregates()}
              onStartRemap={(link) => {
                setOrphansDialogOpen(false);
                setRemapTarget(link);
                toast.info("Modo re-asignar activado. Haz click en un elemento del canvas.", { duration: 6000 });
              }}
            />

            {/* Remap mode banner */}
            {remapTarget && (
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white border-2 border-blue-900 shadow-md px-5 py-3 flex items-center gap-4"
                data-testid="remap-banner"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Chivo', sans-serif" }}>
                    Re-asignar {remapTarget.requirement?.code || "link"}
                  </span>
                </div>
                <span className="text-xs text-blue-100">Haz click en un elemento del canvas</span>
                <button
                  onClick={() => setRemapTarget(null)}
                  data-testid="remap-cancel"
                  className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 border border-blue-400"
                >
                  Cancelar (Esc)
                </button>
              </div>
            )}
            
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-0 bg-white border border-zinc-200 shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showOverlays ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setShowOverlays(!showOverlays)}
                    data-testid="toggle-io-overlays"
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showOverlays ? t("editor.hide_io") : t("editor.show_io")}</TooltipContent>
              </Tooltip>
              <div className="h-5 w-px bg-zinc-200" />
              <Button variant="ghost" size="icon" onClick={() => handleZoom("out")}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={fitToViewport}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleZoom("in")}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Keyboard Shortcuts Panel */}
            {shortcutsOpen && (
              <div className="absolute top-4 right-4 z-50 bg-white border border-zinc-200 shadow-lg w-72 animate-fadeIn" data-testid="shortcuts-panel">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t("editor.shortcuts_title")}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShortcutsOpen(false)} className="h-6 w-6 rounded-lg">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="p-3 space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900 mb-1.5" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("editor.general")}</p>
                    <div className="space-y-1">
                      <ShortcutRow keys="Ctrl+S" action={t("editor.sc_save")} />
                      <ShortcutRow keys="Ctrl+E" action={t("editor.sc_export")} />
                      <ShortcutRow keys="?" action={t("editor.sc_show_hide")} />
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 pt-3">
                    <p className="font-semibold text-zinc-900 mb-1.5" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("editor.tools")}</p>
                    <div className="space-y-1">
                      <ShortcutRow keys="Ctrl+Shift+V" action={t("editor.sc_validate")} />
                      <ShortcutRow keys="Ctrl+Shift+S" action={t("editor.sc_simulate")} />
                      <ShortcutRow keys="Ctrl+Shift+U" action={t("editor.sc_uml")} />
                      <ShortcutRow keys="Ctrl+Shift+D" action={t("editor.sc_docs")} />
                      <ShortcutRow keys="Ctrl+Shift+A" action={t("editor.sc_analytics")} />
                      <ShortcutRow keys="Ctrl+Shift+I" action={t("editor.sc_ai")} />
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 pt-3">
                    <p className="font-semibold text-zinc-900 mb-1.5" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("editor.version_control")}</p>
                    <div className="space-y-1">
                      <ShortcutRow keys="Ctrl+Shift+H" action={t("editor.sc_history")} />
                      <ShortcutRow keys="Ctrl+Shift+B" action={t("editor.sc_branches")} />
                      <ShortcutRow keys="Ctrl+Shift+G" action={t("editor.sc_git")} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {rightPanelOpen && (
            <div className="w-80 border-l border-zinc-200 bg-white flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-zinc-200">
                <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="properties" className="text-xs">{t("editor.props")}</TabsTrigger>
                    <TabsTrigger value="comments" className="text-xs">{t("editor.comments")}</TabsTrigger>
                    <TabsTrigger value="oop" className="text-xs">OOP</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon" onClick={() => setRightPanelOpen(false)} className="ml-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                {rightPanelTab === "properties" && (
                  <div className="p-4">
                    <PropertiesTab
                      selectedElement={selectedElement}
                      elementDataMap={elementDataMap}
                      oopClasses={oopClasses}
                      setElementData={setElementData}
                      t={t}
                    />
                  </div>
                )}

                {rightPanelTab === "comments" && (
                  <div className="p-4">
                    <CommentsTab
                      selectedElement={selectedElement}
                      elementComments={elementComments}
                      newCommentContent={newCommentContent}
                      setNewCommentContent={setNewCommentContent}
                      addComment={addComment}
                      t={t}
                    />
                  </div>
                )}

                {rightPanelTab === "oop" && (
                  <div className="p-4">
                    <OopTab oopClasses={oopClasses} t={t} />
                  </div>
                )}

                {rightPanelTab === "components" && (
                  <div className="p-4">
                    <ComponentsTab components={components} t={t} />
                  </div>
                )}

                {rightPanelTab === "requirements" && (
                  <div className="p-3" data-testid="requirements-panel-content">
                    <RequirementsTab
                      diagramId={diagramId}
                      selectedElement={selectedElement}
                      applyMoscowMarkers={applyMoscowMarkers}
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Save Dialog */}
        <SaveVersionDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          commitMessage={commitMessage}
          setCommitMessage={setCommitMessage}
          versionTags={versionTags}
          setVersionTags={setVersionTags}
          onSave={saveDiagram}
          t={t}
        />

        {/* AI Generator Dialog */}
        <AIGeneratorDialog
          open={aiDialogOpen}
          onOpenChange={setAIDialogOpen}
          aiPrompt={aiPrompt}
          setAIPrompt={setAIPrompt}
          generating={generatingAI}
          onGenerate={generateWithAI}
          t={t}
        />

        {/* Code Analyzer Dialog */}
        <Dialog open={codeAnalyzerOpen} onOpenChange={setCodeAnalyzerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("editor.analyze_code_title")}</DialogTitle>
              <DialogDescription>
                {t("editor.analyze_code_desc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={codeToAnalyze}
                onChange={(e) => setCodeToAnalyze(e.target.value)}
                placeholder={t("editor.paste_code")}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCodeAnalyzerOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={analyzeCode} disabled={generatingAI} className="bg-blue-600 hover:bg-blue-700">
                {generatingAI ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Terminal className="w-4 h-4 mr-2" />
                )}
                {t("editor.analyze")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Branch Dialog with Merge */}
        <BranchManagementDialog
          open={branchDialogOpen}
          onOpenChange={setBranchDialogOpen}
          isAuthenticated={isAuthenticated}
          branches={branches}
          newBranchName={newBranchName}
          setNewBranchName={setNewBranchName}
          onCreateBranch={createBranch}
          onPreviewMerge={handlePreviewMerge}
          t={t}
        />

        {/* Merge Preview/Resolution Dialog */}
        <MergePreviewDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          mergePreview={mergePreview}
          mergeResolutions={mergeResolutions}
          setMergeResolutions={setMergeResolutions}
          onConfirmMerge={handleConfirmMerge}
        />

        {/* Git Integration Dialog */}
        <Dialog open={gitDialogOpen} onOpenChange={setGitDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Integracion Git
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="repos" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="repos" className="flex-1">Repositorios</TabsTrigger>
                <TabsTrigger value="add" className="flex-1">Conectar Repo</TabsTrigger>
              </TabsList>
              <TabsContent value="repos" className="space-y-3 mt-3">
                {gitRepos.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-6">No hay repositorios conectados</p>
                ) : (
                  gitRepos.map((repo) => (
                    <div key={repo.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          <span className="font-medium text-sm">{repo.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{repo.provider}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{repo.repository_url}</p>
                      {repo.last_sync && (
                        <p className="text-xs text-zinc-400">Ultima sync: {new Date(repo.last_sync).toLocaleString("es-ES")}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const resp = await fetch(`${API}/git-repos/${repo.id}/push`, {
                                method: "POST",
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ diagram_id: diagramId })
                              });
                              if (resp.ok) {
                                const data = await resp.json();
                                toast.success(`Push exitoso: ${data.file_path}`);
                                fetchGitRepos();
                              } else {
                                const err = await resp.json();
                                toast.error(err.detail || "Error al hacer push");
                              }
                            } catch (e) { toast.error("Error de conexion"); }
                          }}
                          data-testid={`git-push-${repo.id}`}
                        >
                          <ArrowUp className="w-3.5 h-3.5 mr-1" />
                          Push
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const resp = await fetch(`${API}/git-repos/${repo.id}/pull`, {
                                method: "POST",
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ diagram_id: diagramId })
                              });
                              if (resp.ok) {
                                toast.success("Pull exitoso - Recargando...");
                                setTimeout(() => window.location.reload(), 1000);
                              } else {
                                const err = await resp.json();
                                toast.error(err.detail || "Error al hacer pull");
                              }
                            } catch (e) { toast.error("Error de conexion"); }
                          }}
                          data-testid={`git-pull-${repo.id}`}
                        >
                          <ArrowDown className="w-3.5 h-3.5 mr-1" />
                          Pull
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600"
                          onClick={async () => {
                            await fetch(`${API}/git-repos/${repo.id}`, {
                              method: "DELETE", headers: getAuthHeaders()
                            });
                            fetchGitRepos();
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="add" className="space-y-3 mt-3">
                <div>
                  <Label>Nombre del repositorio</Label>
                  <Input
                    value={newGitRepo.name}
                    onChange={(e) => setNewGitRepo(p => ({ ...p, name: e.target.value }))}
                    placeholder="Mi Repo BPMN"
                    data-testid="git-repo-name"
                  />
                </div>
                <div>
                  <Label>URL del repositorio</Label>
                  <Input
                    value={newGitRepo.repository_url}
                    onChange={(e) => setNewGitRepo(p => ({ ...p, repository_url: e.target.value }))}
                    placeholder="https://github.com/usuario/repo"
                    data-testid="git-repo-url"
                  />
                </div>
                <div>
                  <Label>Personal Access Token (GitHub)</Label>
                  {user?.github_login ? (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                      <Github className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700">
                        Conectado como <strong>@{user.github_login}</strong>
                      </span>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="password"
                        value={newGitRepo.access_token}
                        onChange={(e) => setNewGitRepo(p => ({ ...p, access_token: e.target.value }))}
                        placeholder="ghp_xxxxxxxxxxxx"
                        data-testid="git-repo-token"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Necesita permisos: repo (read/write). <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">Crear token &rarr;</a></p>
                    </>
                  )}
                </div>
                <div>
                  <Label>Carpeta en el repo</Label>
                  <Input
                    value={newGitRepo.sync_path}
                    onChange={(e) => setNewGitRepo(p => ({ ...p, sync_path: e.target.value }))}
                    placeholder="bpmn/"
                    data-testid="git-repo-path"
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const resp = await fetch(`${API}/git-repos`, {
                        method: "POST",
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ ...newGitRepo, provider: "github" })
                      });
                      if (resp.ok) {
                        toast.success("Repositorio conectado");
                        setNewGitRepo({ name: "", repository_url: "", access_token: "", sync_path: "bpmn/" });
                        fetchGitRepos();
                      } else {
                        toast.error("Error al conectar repositorio");
                      }
                    } catch (e) { toast.error("Error de conexion"); }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="connect-git-repo-btn"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Conectar Repositorio
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* History Sheet */}
        <HistorySheet
          open={historyOpen}
          onOpenChange={(open) => { setHistoryOpen(open); if (open) fetchVersionTree(); }}
          historyTab={historyTab}
          setHistoryTab={setHistoryTab}
          versions={versions}
          versionTree={versionTree}
          diffVersionA={diffVersionA}
          setDiffVersionA={setDiffVersionA}
          diffVersionB={diffVersionB}
          setDiffVersionB={setDiffVersionB}
          loadingDiff={loadingDiff}
          fetchDiff={fetchDiff}
          revertToVersion={revertToVersion}
        />

        {/* Diff Dialog */}
        <Dialog open={diffDialogOpen} onOpenChange={setDiffDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                Comparacion de Versiones
              </DialogTitle>
              {diffData && (
                <DialogDescription>
                  Version {diffData.version_from.number} → Version {diffData.version_to.number} | {diffData.summary.total_changes} cambios
                </DialogDescription>
              )}
            </DialogHeader>
            {diffData && (
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <PlusCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-lg font-bold text-emerald-700">{diffData.summary.added_count}</p>
                      <p className="text-xs text-emerald-600">Agregados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
                    <MinusCircle className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="text-lg font-bold text-rose-700">{diffData.summary.removed_count}</p>
                      <p className="text-xs text-rose-600">Eliminados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <Pencil className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-lg font-bold text-amber-700">{diffData.summary.modified_count}</p>
                      <p className="text-xs text-amber-600">Modificados</p>
                    </div>
                  </div>
                </div>

                {/* Version info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50">
                    <p className="text-xs font-semibold text-zinc-500 mb-1">Version {diffData.version_from.number}</p>
                    <p className="text-sm text-zinc-700">{diffData.version_from.commit_message || "Sin mensaje"}</p>
                    <p className="text-xs text-zinc-400 mt-1">{diffData.version_from.created_by} - {new Date(diffData.version_from.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <p className="text-xs font-semibold text-blue-500 mb-1">Version {diffData.version_to.number}</p>
                    <p className="text-sm text-zinc-700">{diffData.version_to.commit_message || "Sin mensaje"}</p>
                    <p className="text-xs text-zinc-400 mt-1">{diffData.version_to.created_by} - {new Date(diffData.version_to.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>

                {/* Changes Detail */}
                {diffData.summary.total_changes === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="font-medium">Sin diferencias</p>
                    <p className="text-sm">Las versiones son identicas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Added Elements */}
                    {diffData.added.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 mb-1.5 flex items-center gap-1">
                          <PlusCircle className="w-3.5 h-3.5" />Elementos agregados
                        </p>
                        <div className="space-y-1">
                          {diffData.added.map((el) => (
                            <div key={el.id} className="flex items-center gap-2 p-2 rounded border border-emerald-200 bg-emerald-50">
                              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">{el.type}</Badge>
                              <span className="text-sm text-zinc-700">{el.name || el.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Removed Elements */}
                    {diffData.removed.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-rose-600 mb-1.5 flex items-center gap-1">
                          <MinusCircle className="w-3.5 h-3.5" />Elementos eliminados
                        </p>
                        <div className="space-y-1">
                          {diffData.removed.map((el) => (
                            <div key={el.id} className="flex items-center gap-2 p-2 rounded border border-rose-200 bg-rose-50">
                              <Badge variant="secondary" className="text-[10px] bg-rose-100 text-rose-700">{el.type}</Badge>
                              <span className="text-sm text-zinc-700 line-through">{el.name || el.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Modified Elements */}
                    {diffData.modified.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 mb-1.5 flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" />Elementos modificados
                        </p>
                        <div className="space-y-1">
                          {diffData.modified.map((el) => (
                            <div key={el.id} className="p-2 rounded border border-amber-200 bg-amber-50">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">{el.after.type}</Badge>
                                <span className="text-xs text-zinc-500">{el.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-rose-600 line-through">{el.before.name || "(sin nombre)"}</div>
                                <div className="text-emerald-600">{el.after.name || "(sin nombre)"}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDiffDialogOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* P2 Feature Dialogs */}
        <ValidationDialog open={validationOpen} onOpenChange={setValidationOpen} diagramId={diagramId} getAuthHeaders={getAuthHeaders} />
        <UMLDialog open={umlOpen} onOpenChange={setUmlOpen} diagramId={diagramId} getAuthHeaders={getAuthHeaders} />
        <SimulatorDialog open={simulatorOpen} onOpenChange={setSimulatorOpen} diagramId={diagramId} getAuthHeaders={getAuthHeaders} modelerRef={modelerRef} />
        <DocsDialog open={docsOpen} onOpenChange={setDocsOpen} diagramId={diagramId} getAuthHeaders={getAuthHeaders} />
        <AnalyticsDialog open={analyticsOpen} onOpenChange={setAnalyticsOpen} diagramId={diagramId} getAuthHeaders={getAuthHeaders} />

        {/* Summary / Prompt Generation Dialog - Multi-step */}
        <SummaryLlmDialog
          open={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          diagram={diagram}
          step={editorSummaryStep}
          setStep={setEditorSummaryStep}
          includeXml={editorSummaryIncludeXml}
          setIncludeXml={setEditorSummaryIncludeXml}
          includeOop={editorSummaryIncludeOop}
          setIncludeOop={setEditorSummaryIncludeOop}
          context={editorSummaryContext}
          setContext={setEditorSummaryContext}
          summary={editorSummary}
          setSummary={setEditorSummary}
          copiedSummary={copiedEditorSummary}
          copySummary={copyEditorSummary}
          downloadSummary={downloadEditorSummary}
          generating={generatingSummaryEditor}
          onGenerateSummary={handleGenerateSummaryEditor}
          llmProvider={editorLlmProvider}
          setLlmProvider={setEditorLlmProvider}
          opencodeModel={editorOpencodeModel}
          setOpencodeModel={setEditorOpencodeModel}
          llmOutputType={editorLlmOutputType}
          setLlmOutputType={setEditorLlmOutputType}
          llmLanguage={editorLlmLanguage}
          setLlmLanguage={setEditorLlmLanguage}
          processing={editorProcessingLlm}
          onProcessWithLlm={handleEditorProcessWithLlm}
          result={editorLlmResult}
          setResult={setEditorLlmResult}
          copiedResult={copiedEditorLlmResult}
          copyResult={copyEditorLlmResult}
          downloadResult={downloadEditorLlmResult}
        />
      </div>
    </TooltipProvider>
  );
};

export default BpmnEditorPage;
