// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Realtime collaboration on a BPMN diagram via WebSocket.
 *
 * Connects to `/api/ws/diagram/{diagramId}`, tracks presence, remote cursors
 * and per-element edit locks. Renders remote cursors as DOM overlays inside
 * `containerRef` and lock overlays via bpmn-js `overlays` service.
 *
 * @param {React.MutableRefObject} modelerRef    Ref to bpmn-js modeler.
 * @param {React.MutableRefObject} containerRef  Ref to canvas container DOM node.
 * @param {string|undefined}       diagramId
 */
export function useCollaboration(modelerRef, containerRef, diagramId) {
  const wsRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);
  const [lockedElements, setLockedElements] = useState({});
  const [remoteCursors, setRemoteCursors] = useState({});

  // ----- WebSocket lifecycle ------------------------------------------------
  useEffect(() => {
    if (!diagramId) return undefined;

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const wsUrl = backendUrl
      ? backendUrl.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://")
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
    const ws = new WebSocket(`${wsUrl}/api/ws/diagram/${diagramId}`);

    ws.onopen = () => {
      console.debug("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setCollaborators(data.users);
        const userIds = new Set(data.users.map((u) => u.id));
        setRemoteCursors((prev) => {
          const next = {};
          Object.entries(prev).forEach(([k, v]) => { if (userIds.has(k)) next[k] = v; });
          return next;
        });
        setLockedElements((prev) => {
          const next = {};
          Object.entries(prev).forEach(([k, v]) => { if (userIds.has(v.user_id)) next[k] = v; });
          return next;
        });
      } else if (data.type === "cursor") {
        setRemoteCursors((prev) => ({
          ...prev,
          [data.user_id]: {
            x: data.position.x,
            y: data.position.y,
            name: data.user_name,
            color: data.color,
          },
        }));
      } else if (data.type === "select") {
        // Show selection indicator (no-op placeholder)
      } else if (data.type === "lock") {
        setLockedElements((prev) => ({
          ...prev,
          [data.element_id]: {
            user_id: data.user_id,
            user_name: data.user_name,
            color: data.color,
          },
        }));
      } else if (data.type === "unlock") {
        setLockedElements((prev) => {
          const next = { ...prev };
          delete next[data.element_id];
          return next;
        });
      } else if (data.type === "update") {
        if (modelerRef.current && data.user_id) {
          try {
            modelerRef.current.importXML(data.xml).catch(() => {});
          } catch (err) {
            console.warn("WebSocket: failed to import XML update:", err.message);
          }
        }
      }
    };

    ws.onclose = () => {
      console.debug("WebSocket disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [diagramId, modelerRef]);

  // ----- Outgoing messages --------------------------------------------------
  const handleCanvasMouseMove = useCallback((e) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!modelerRef.current) return;
    try {
      const canvas = modelerRef.current.get("canvas");
      const vbox = canvas.viewbox();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = vbox.x + (e.clientX - rect.left) * (vbox.width / rect.width);
      const y = vbox.y + (e.clientY - rect.top) * (vbox.height / rect.height);
      wsRef.current.send(JSON.stringify({ type: "cursor", position: { x, y } }));
    } catch (err) {
      console.warn("Cursor broadcast error:", err.message);
    }
  }, [modelerRef]);

  const handleElementLock = useCallback((elementId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "lock", element_id: elementId }));
  }, []);

  const handleElementUnlock = useCallback((elementId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "unlock", element_id: elementId }));
  }, []);

  const broadcastChange = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !modelerRef.current) return;
    modelerRef.current.saveXML({ format: true }).then(({ xml }) => {
      wsRef.current.send(JSON.stringify({ type: "update", xml }));
    }).catch(() => {});
  }, [modelerRef]);

  // ----- Render remote cursors as DOM overlays ------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll(".remote-cursor").forEach((el) => el.remove());
    if (!modelerRef.current) return;

    try {
      const canvas = modelerRef.current.get("canvas");
      const vbox = canvas.viewbox();
      const rect = container.getBoundingClientRect();

      Object.entries(remoteCursors).forEach(([uid, cursor]) => {
        const screenX = ((cursor.x - vbox.x) / vbox.width) * rect.width;
        const screenY = ((cursor.y - vbox.y) / vbox.height) * rect.height;
        if (screenX < 0 || screenX > rect.width || screenY < 0 || screenY > rect.height) return;
        const el = document.createElement("div");
        el.className = "remote-cursor";
        el.style.cssText = `position:absolute;left:${screenX}px;top:${screenY}px;pointer-events:none;z-index:50;transition:left 0.15s,top 0.15s;`;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "20");
        svg.setAttribute("viewBox", "0 0 16 20");
        svg.setAttribute("fill", cursor.color);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M0 0L16 12L8 12L12 20L8 18L4 12L0 12Z");
        svg.appendChild(path);
        el.appendChild(svg);
        const label = document.createElement("span");
        label.style.cssText = `background:${cursor.color};color:#fff;font-size:10px;padding:1px 5px;border-radius:3px;margin-left:4px;white-space:nowrap;position:absolute;top:14px;left:8px;`;
        label.textContent = cursor.name || uid;
        el.appendChild(label);
        container.appendChild(el);
      });
    } catch (_err) { /* canvas op */ }
  }, [remoteCursors, containerRef, modelerRef]);

  // ----- Render lock overlays on elements ----------------------------------
  useEffect(() => {
    if (!modelerRef.current) return;
    try {
      const overlays = modelerRef.current.get("overlays");
      try { overlays.remove({ type: "element-lock" }); } catch (_err) { /* canvas op */ }
      Object.entries(lockedElements).forEach(([elementId, lock]) => {
        const registry = modelerRef.current.get("elementRegistry");
        const el = registry.get(elementId);
        if (!el || !el.width) return;
        const html = document.createElement("div");
        const inner = document.createElement("div");
        inner.style.cssText = `background:${lock.color};color:#fff;font-size:9px;padding:1px 6px;border-radius:3px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);`;
        inner.textContent = `Editando: ${lock.user_name || lock.user_id}`;
        html.appendChild(inner);
        overlays.add(el.id, "element-lock", { position: { top: -20, right: 0 }, html });
      });
    } catch (err) {
      console.warn("Error rendering lock overlays:", err.message);
    }
  }, [lockedElements, modelerRef]);

  return {
    collaborators,
    lockedElements,
    handleCanvasMouseMove,
    handleElementLock,
    handleElementUnlock,
    broadcastChange,
  };
}
