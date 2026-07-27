// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold, Italic, Code, List, ListOrdered, ListChecks,
  Quote, Minus, Heading1, Heading2, Heading3,
  Code2, Link, Table2, ChevronDown, Eye, ChevronUp,
} from "lucide-react";

function insertAtCursor(textarea, before, after, placeholder) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const content = selected || placeholder || "";
  const newText =
    textarea.value.substring(0, start) +
    before +
    content +
    after +
    textarea.value.substring(end);

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;
  nativeSetter.call(textarea, newText);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newCursor = start + before.length + content.length;
  textarea.selectionStart = textarea.selectionEnd = newCursor;
  textarea.focus();
}

const TEMPLATES = [
  { label: "Descripción general", insert: "## Descripción\n\n" },
  { label: "Objetivo", insert: "## Objetivo\n\n" },
  { label: "Contexto", insert: "## Contexto\n\n" },
  { label: "Requisitos funcionales", insert: "## Requisitos Funcionales\n\n- \n- \n" },
  { label: "Requisitos no funcionales", insert: "## Requisitos No Funcionales\n\n- \n- \n" },
  { label: "Criterios de aceptación", insert: "## Criterios de Aceptación\n\n- [ ] \n- [ ] " },
  { label: "BDD (Given/When/Then)", insert: "**Given** \n**When** \n**Then** " },
  { label: "Tabla de ejemplos", insert: "| Escenario | Entrada | Esperado |\n| --- | --- | --- |\n| | | |" },
];

const TOOLS = [
  // Headings
  { icon: Heading1, label: "H1", action: (ta) => insertAtCursor(ta, "# ", "", "") },
  { icon: Heading2, label: "H2", action: (ta) => insertAtCursor(ta, "## ", "", "") },
  { icon: Heading3, label: "H3", action: (ta) => insertAtCursor(ta, "### ", "", "") },
  null,
  // Inline
  { icon: Bold, label: "Negrita", action: (ta) => insertAtCursor(ta, "**", "**", "texto") },
  { icon: Italic, label: "Cursiva", action: (ta) => insertAtCursor(ta, "*", "*", "texto") },
  { icon: Code, label: "Código inline", action: (ta) => insertAtCursor(ta, "`", "`", "código") },
  null,
  // Blocks
  { icon: List, label: "Lista", action: (ta) => insertAtCursor(ta, "- ", "", "") },
  { icon: ListOrdered, label: "Lista numerada", action: (ta) => insertAtCursor(ta, "1. ", "", "") },
  { icon: ListChecks, label: "Checklist", action: (ta) => insertAtCursor(ta, "- [ ] ", "", "") },
  { icon: Quote, label: "Cita", action: (ta) => insertAtCursor(ta, "> ", "", "") },
  { icon: Minus, label: "Línea horizontal", action: (ta) => insertAtCursor(ta, "\n---\n", "", "") },
  null,
  // Special
  { icon: Code2, label: "Bloque de código", action: (ta) => insertAtCursor(ta, "```\n", "\n```", "código") },
  { icon: Link, label: "Enlace", action: (ta) => insertAtCursor(ta, "[", "](url)", "texto") },
  { icon: Table2, label: "Tabla", action: (ta) => insertAtCursor(ta, "| Col 1 | Col 2 |\n| --- | --- |\n| ", " |\n| | |", "celda") },
];

export default function MarkdownEditor({
  value,
  onChange,
  label,
  rows = 6,
  placeholder,
  dataTestId,
}) {
  const textareaRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleTool = useCallback(
    (tool) => {
      const ta = textareaRef.current;
      if (!ta) return;
      tool.action(ta);
    },
    []
  );

  const handleTemplate = useCallback(
    (tpl) => {
      const ta = textareaRef.current;
      if (!ta) return;
      insertAtCursor(ta, tpl.insert, "", "");
      setTemplatesOpen(false);
    },
    []
  );

  const btn = "h-6 w-6 p-0 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors flex items-center justify-center";
  const sep = <div className="w-px h-4 bg-zinc-200 mx-0.5" />;

  return (
    <div>
      {label && (
        <label className="text-xs font-mono uppercase text-zinc-500 mb-1 block">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 border border-zinc-200 border-b-0 bg-zinc-50/50 flex-wrap">
        {TOOLS.map((tool, i) => {
          if (!tool) return <div key={`s${i}`}>{sep}</div>;
          return (
            <button
              key={tool.label}
              type="button"
              className={btn}
              title={tool.label}
              onClick={() => handleTool(tool)}
            >
              <tool.icon className="w-3.5 h-3.5" />
            </button>
          );
        })}

        {sep}

        {/* Templates dropdown */}
        <div className="relative">
          <button
            type="button"
            className={`${btn} gap-0.5 px-1 w-auto text-xs font-semibold`}
            title="Apartados"
            onClick={() => setTemplatesOpen((v) => !v)}
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
            Apartados
          </button>
          {templatesOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTemplatesOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-zinc-200 shadow min-w-[200px]">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    className="block w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 text-zinc-700"
                    onClick={() => handleTemplate(tpl)}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {sep}

        {/* Preview toggle */}
        <button
          type="button"
          className={`${btn} ${previewOpen ? "bg-zinc-200 text-zinc-700" : ""}`}
          title="Preview"
          onClick={() => setPreviewOpen((v) => !v)}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-zinc-200 rounded-lg font-mono text-sm px-3 py-2 focus:outline-none focus:border-zinc-400 resize-y"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        data-testid={dataTestId}
      />

      {/* Preview */}
      {previewOpen && (
        <div className="border border-zinc-200 border-t-0 bg-zinc-50 p-3 max-h-[200px] overflow-y-auto">
          <div className="text-xs prose prose-sm max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-code:text-zinc-600 prose-a:text-blue-600">
            {value?.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-300 italic m-0">Sin contenido</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
