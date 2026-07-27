// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Badge } from "@/components/ui/badge";

export const ComponentsTab = React.memo(({ components, t }) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 mb-2">{t("editor.drag_component")}</p>
      {components.map((comp) => (
        <div
          key={comp.id}
          draggable
          className="p-3 border border-zinc-200 rounded-lg cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{comp.name}</span>
            <Badge variant="secondary" className="text-xs">{comp.category}</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{comp.description}</p>
        </div>
      ))}
      {components.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-4">
          {t("editor.no_components_avail")}
        </p>
      )}
    </div>
  );
});
