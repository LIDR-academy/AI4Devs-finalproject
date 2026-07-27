// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Badge } from "@/components/ui/badge";

export const OopTab = React.memo(({ oopClasses, t }) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 mb-2">{t("editor.drag_class")}</p>
      {oopClasses.map((oopClass) => (
        <div
          key={oopClass.id}
          draggable
          className="p-3 border border-zinc-200 rounded-lg cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{oopClass.name}</span>
            <Badge variant="secondary" className="text-xs">{oopClass.category}</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {oopClass.properties?.length || 0} {t("oop.properties_count")}
          </p>
        </div>
      ))}
      {oopClasses.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-4">
          {t("editor.no_oop_defined")}
        </p>
      )}
    </div>
  );
});
