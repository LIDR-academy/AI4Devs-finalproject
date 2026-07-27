// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

let _mermaidInit = false;
const initMermaid = () => {
  if (_mermaidInit) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "loose",
    fontFamily: "'IBM Plex Mono', monospace",
    suppressErrorRendering: true,
  });
  _mermaidInit = true;
};

const MermaidBlock = ({ code }) => {
  const ref = useRef(null);
  const [err, setErr] = useState("");
  const [svg, setSvg] = useState("");
  const idRef = useRef(`m-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    initMermaid();
    let cancelled = false;
    (async () => {
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, code);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (err) {
    return (
      <details className="my-3 border border-amber-300 bg-amber-50 text-xs" data-testid="mermaid-error">
        <summary className="p-2 cursor-pointer font-medium text-amber-800">
          Diagrama no disponible (error de sintaxis Mermaid generado por IA)
        </summary>
        <div className="px-3 pb-3">
          <pre className="whitespace-pre-wrap text-amber-700 text-[10px]">{err}</pre>
          <details className="mt-2 cursor-pointer">
            <summary className="text-amber-600 text-[10px]">Código fuente</summary>
            <pre className="whitespace-pre-wrap mt-1 text-zinc-600 text-[10px]">{code}</pre>
          </details>
        </div>
      </details>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 p-4 border border-zinc-200 bg-white overflow-x-auto flex justify-center"
      data-testid="mermaid-block"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

/** Renders Markdown with Mermaid blocks auto-rendered inline. */
const SpeckitRenderer = ({ markdown }) => {
  return (
    <div className="speckit-doc prose prose-zinc prose-sm max-w-none" data-testid="speckit-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];
            const value = String(children).replace(/\n$/, "");
            if (!inline && lang === "mermaid") {
              return <MermaidBlock code={value} />;
            }
            if (!inline) {
              return (
                <pre className="bg-deep-navy text-zinc-100 p-3 overflow-x-auto text-xs" {...rest}>
                  <code>{value}</code>
                </pre>
              );
            }
            return <code className="bg-zinc-100 px-1 py-0.5 text-[0.9em]" {...rest}>{children}</code>;
          },
          table({ children }) {
            return <table className="w-full border-collapse text-sm my-3">{children}</table>;
          },
          th({ children }) {
            return <th className="border border-zinc-300 px-2 py-1 bg-zinc-100 text-left text-xs font-mono uppercase">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-zinc-300 px-2 py-1 align-top">{children}</td>;
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold text-zinc-900 mt-6 mb-3 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-zinc-900 mt-5 mb-2 tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-zinc-800 mt-4 mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc ml-6 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-6 my-2 space-y-1">{children}</ol>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">{children}</a>,
        }}
      >
        {markdown || ""}
      </ReactMarkdown>
    </div>
  );
};

export default SpeckitRenderer;
export { MermaidBlock };
