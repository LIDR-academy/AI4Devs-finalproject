// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import LinkedRequirementsWidget from "@/components/LinkedRequirementsWidget";

export const RequirementsTab = ({ diagramId, selectedElement, applyMoscowMarkers }) => {
  if (!diagramId) {
    return (
      <p className="text-xs text-zinc-500 italic">
        Guarda el diagrama primero para poder enlazar requirements.
      </p>
    );
  }

  return (
    <LinkedRequirementsWidget
      diagramId={diagramId}
      selectedElement={selectedElement}
      onLinksChange={applyMoscowMarkers}
      collapsed={false}
    />
  );
};
