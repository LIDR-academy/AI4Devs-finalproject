// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useCallback, useEffect, useState } from "react";

/**
 * Manage per-element Input/Output data on a BPMN canvas.
 *
 * Persists each element's I/O config inside a `[OOP_IO]...[/OOP_IO]` block in
 * its `bpmn:Documentation`. Also renders IN/OUT badges as bpmn-js overlays.
 *
 * @param {React.MutableRefObject} modelerRef  Ref to the bpmn-js modeler instance.
 * @param {(b:boolean)=>void} setHasChanges    Mark editor dirty after a setData.
 */
export function useElementIO(modelerRef, setHasChanges) {
  const [elementDataMap, setElementDataMap] = useState({});
  const [showOverlays, setShowOverlays] = useState(true);

  const setElementData = useCallback(
    (elementId, field, value) => {
      setElementDataMap((prev) => {
        const current = prev[elementId] || {};
        return { ...prev, [elementId]: { ...current, [field]: value } };
      });
      setHasChanges(true);
    },
    [setHasChanges]
  );

  // Extract element I/O data from BPMN XML documentation
  const parseElementDataFromXml = useCallback((modeler) => {
    try {
      const registry = modeler.get("elementRegistry");
      const map = {};
      registry.forEach((el) => {
        const bo = el.businessObject;
        if (!bo) return;
        const docs = bo.documentation;
        if (docs && docs.length > 0) {
          const text = docs[0].text || "";
          const match = text.match(/\[OOP_IO\](.*)\[\/OOP_IO\]/s);
          if (match) {
            try {
              map[el.id] = JSON.parse(match[1]);
            } catch (parseErr) {
              console.warn("Failed to parse element data:", el.id, parseErr.message);
            }
          }
        }
      });
      setElementDataMap(map);
    } catch (err) {
      console.warn("Error parsing element data from XML:", err.message);
    }
  }, []);

  // Save element I/O data into BPMN XML documentation
  const saveElementDataToXml = useCallback(() => {
    if (!modelerRef.current) return;
    try {
      const modeler = modelerRef.current;
      const modeling = modeler.get("modeling");
      const moddle = modeler.get("moddle");
      const registry = modeler.get("elementRegistry");

      Object.entries(elementDataMap).forEach(([elementId, data]) => {
        const el = registry.get(elementId);
        if (!el) return;
        const bo = el.businessObject;
        const json = JSON.stringify(data);
        const tag = `[OOP_IO]${json}[/OOP_IO]`;

        let docs = bo.documentation || [];
        const oopDoc = docs.find((d) => (d.text || "").includes("[OOP_IO]"));
        if (oopDoc) {
          oopDoc.text = tag;
        } else {
          const docEl = moddle.create("bpmn:Documentation", { text: tag });
          docs = [...docs, docEl];
        }
        modeling.updateProperties(el, { documentation: docs });
      });
    } catch (err) {
      console.warn("Error saving I/O data to XML:", err);
    }
  }, [elementDataMap, modelerRef]);

  // Render IN/OUT badges as bpmn-js overlays
  const renderIOOverlays = useCallback(() => {
    if (!modelerRef.current) return;
    try {
      const overlays = modelerRef.current.get("overlays");
      const registry = modelerRef.current.get("elementRegistry");

      try { overlays.remove({ type: "io-input" }); } catch (_err) { /* canvas op */ }
      try { overlays.remove({ type: "io-output" }); } catch (_err) { /* canvas op */ }

      if (!showOverlays) return;

      Object.entries(elementDataMap).forEach(([elementId, data]) => {
        const el = registry.get(elementId);
        if (!el || !el.width || el.type === "bpmn:Process" || el.type === "bpmn:Collaboration") return;
        const hasInput = data.inputClass && data.inputClass !== "__none__" ? data.inputClass : data.inputCustom;
        const hasOutput = data.outputClass && data.outputClass !== "__none__" ? data.outputClass : data.outputCustom;

        if (hasInput) {
          const html = document.createElement("div");
          const span = document.createElement("span");
          span.className = "io-badge io-in";
          span.textContent = `IN: ${hasInput}`;
          html.appendChild(span);
          overlays.add(el.id, "io-input", { position: { top: -24, left: 0 }, html });
        }
        if (hasOutput) {
          const html = document.createElement("div");
          const span = document.createElement("span");
          span.className = "io-badge io-out";
          span.textContent = `OUT: ${hasOutput}`;
          html.appendChild(span);
          overlays.add(el.id, "io-output", { position: { bottom: -8, left: 0 }, html });
        }
      });
    } catch (err) {
      console.warn("Error rendering I/O overlays:", err);
    }
  }, [elementDataMap, showOverlays, modelerRef]);

  // Re-render overlays when data or visibility changes
  useEffect(() => {
    renderIOOverlays();
  }, [renderIOOverlays]);

  return {
    elementDataMap,
    setElementData,
    parseElementDataFromXml,
    saveElementDataToXml,
    showOverlays,
    setShowOverlays,
  };
}
