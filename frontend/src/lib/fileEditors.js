// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

/**
 * Extensible registry mapping file extensions to their editors.
 *
 * Editor types:
 *   'route'  — navigates to a URL (with optional newTab)
 *   'inline' — opens in the current page's FilePreviewPanel sidebar
 *
 * To register a new file type, add an entry to FILE_EDITORS below.
 */

const FILE_EDITORS = {
  '.bpmn': {
    type: 'route',
    getUrl: (file) => file.diagramId ? `/editor/${file.diagramId}` : null,
    newTab: true,
  },
  '.md': {
    type: 'inline',
  },
  // Register new formats here:
  // '.json':  { type: 'route', getUrl: (f) => `/custom-schemas?file=${f._projectFileId}` },
  // '.py':    { type: 'route', getUrl: (f, projectId) => `/projects/${projectId}/codegen` },
  // '.spec':  { type: 'route', getUrl: (f) => `/specs/${f.specId}` },
};

/**
 * Return the editor config for a file, or null if unregistered.
 *
 * @param {string} fileName  - e.g. "readme.md" or "diagram.bpmn"
 * @returns {object|null}    - { type, getUrl?, newTab? } or null
 */
export function getEditorForFile(fileName) {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return FILE_EDITORS[ext] || null;
}

/**
 * If a file has a 'route' editor, return the URL to navigate to.
 * Returns null for inline editors or unregistered extensions.
 *
 * @param {string} fileName
 * @param {object} file     - { name, diagramId, _projectFileId, projectId, ... }
 * @returns {string|null}
 */
export function getEditorUrl(fileName, file = {}) {
  const editor = getEditorForFile(fileName);
  if (editor?.type === 'route' && editor.getUrl) {
    return editor.getUrl(file);
  }
  return null;
}

/**
 * Auto-register a .bpmn file as a diagram in the project, then return
 * the new diagram id so the caller can open the editor.
 *
 * Steps:
 *   1. POST /api/diagrams        — create the diagram with the BPMN XML
 *   2. POST /api/projects/{id}/diagrams/{id} — link it to the project
 *
 * @param {string} name       - file name (e.g. "process.bpmn")
 * @param {string} bpmnXml    - BPMN 2.0 XML content
 * @param {string} projectId  - project UUID
 * @param {string} apiBase    - API base URL (e.g. "https://sdd-ia.com/api")
 * @returns {Promise<string|null>} diagram id, or null on failure
 */
export async function registerBpmnAsDiagram(name, bpmnXml, projectId, apiBase) {
  const cookieToken = document.cookie.split("session_token=")[1]?.split(";")[0];
  const localToken = localStorage.getItem("session_token");
  const token = cookieToken || localToken || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const diagName = name.replace(/\.bpmn$/i, "").replace(/_/g, " ").trim();
  const xml = bpmnXml && bpmnXml.length > 50 && bpmnXml.includes("definitions")
    ? bpmnXml
    : ""; // let the backend use its default if content is missing/broken

  try {
    // 1. Create the diagram
    const res = await fetch(`${apiBase}/diagrams`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: diagName,
        description: "",
        current_xml: xml,
        tags: [],
      }),
    });
    if (!res.ok) return null;
    const diagram = await res.json();

    // 2. Link to project
    await fetch(`${apiBase}/projects/${projectId}/diagrams/${diagram.id}`, {
      method: "POST",
      headers,
    });

    return diagram.id;
  } catch {
    return null;
  }
}

export default FILE_EDITORS;
