// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useEffect, useRef } from "react";

/**
 * Register the BPMN editor's global keyboard shortcuts.
 *
 * Ignored when the user is typing inside an input, textarea, select or any
 * `contenteditable` element.
 *
 * Handler functions are read via a ref on every keypress, so callers can pass
 * unstable arrow functions defined later in their component body — the latest
 * version is always invoked without re-registering the listener.
 *
 * Bindings:
 *   Ctrl/Cmd+S            → onSave        (requires `isAuthenticated`)
 *   Ctrl/Cmd+Shift+V      → onValidate    (requires `diagramId`)
 *   Ctrl/Cmd+Shift+S      → onSimulator   (requires `diagramId`)
 *   Ctrl/Cmd+Shift+U      → onUml         (requires `diagramId`)
 *   Ctrl/Cmd+Shift+D      → onDocs        (requires `diagramId`)
 *   Ctrl/Cmd+Shift+A      → onAnalytics   (requires `diagramId`)
 *   Ctrl/Cmd+Shift+H      → onHistory
 *   Ctrl/Cmd+Shift+B      → onBranches    (requires `diagramId`)
 *   Ctrl/Cmd+Shift+G      → onGit         (requires `diagramId` && `isAuthenticated`)
 *   Ctrl/Cmd+Shift+I      → onAi          (requires `isAuthenticated`)
 *   Ctrl/Cmd+E            → onExport
 *   ?                     → onToggleShortcuts
 */
export function useEditorShortcuts(handlers) {
  const { diagramId, isAuthenticated } = handlers;
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        document.activeElement?.isContentEditable
      ) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();
      const h = handlersRef.current;

      if (ctrl && !shift && key === "s") {
        e.preventDefault();
        if (h.isAuthenticated) h.onSave?.();
      } else if (ctrl && shift && key === "v") {
        e.preventDefault();
        if (h.diagramId) h.onValidate?.();
      } else if (ctrl && shift && key === "s") {
        e.preventDefault();
        if (h.diagramId) h.onSimulator?.();
      } else if (ctrl && shift && key === "u") {
        e.preventDefault();
        if (h.diagramId) h.onUml?.();
      } else if (ctrl && shift && key === "d") {
        e.preventDefault();
        if (h.diagramId) h.onDocs?.();
      } else if (ctrl && shift && key === "a") {
        e.preventDefault();
        if (h.diagramId) h.onAnalytics?.();
      } else if (ctrl && shift && key === "h") {
        e.preventDefault();
        h.onHistory?.();
      } else if (ctrl && shift && key === "b") {
        e.preventDefault();
        if (h.diagramId) h.onBranches?.();
      } else if (ctrl && shift && key === "g") {
        e.preventDefault();
        if (h.diagramId && h.isAuthenticated) h.onGit?.();
      } else if (ctrl && shift && key === "i") {
        e.preventDefault();
        if (h.isAuthenticated) h.onAi?.();
      } else if (ctrl && key === "e") {
        e.preventDefault();
        h.onExport?.();
      } else if (e.key === "?" && !ctrl && !shift) {
        e.preventDefault();
        h.onToggleShortcuts?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [diagramId, isAuthenticated]);
}
