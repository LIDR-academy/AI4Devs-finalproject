import type { PropsWithChildren } from "react";

import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsSearch } from "@/components/docs/docs-search";
import { TableOfContents } from "@/components/docs/table-of-contents";

export default function DocsLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      {/* Docs header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Documentation</span>
        <DocsSearch />
      </div>

      {/* Three-column layout: sidebar | content | TOC */}
      <div className="flex gap-8">
        {/* DocsSidebar handles mobile toggle and desktop sticky sidebar */}
        <DocsSidebar />

        {/* Main content */}
        <main aria-label="Documentation content" className="min-w-0 flex-1">
          {children}
        </main>

        {/* Right TOC — desktop only */}
        <div className="w-48 shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </div>
      </div>
    </div>
  );
}
