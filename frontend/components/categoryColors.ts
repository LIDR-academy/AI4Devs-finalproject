export interface CategoryColor {
  background: string;
  text: string;
}

const CATEGORY_COLORS: Record<string, CategoryColor> = {
  Urgencias: { background: "#FEE2E2", text: "#B91C1C" },
  "Cirugía": { background: "#DBEAFE", text: "#1E40AF" },
  Consulta: { background: "#F1F5F9", text: "#334155" },
  "Analítica": { background: "#F1F5F9", text: "#334155" },
  "Síntoma": { background: "#FEF3C7", text: "#92400E" },
  Seguimiento: { background: "#F1F5F9", text: "#475569" },
};

const DEFAULT_COLOR: CategoryColor = { background: "#F1F5F9", text: "#334155" };

export function getCategoryColor(type: string): CategoryColor {
  return CATEGORY_COLORS[type] ?? DEFAULT_COLOR;
}

export function getCategoryLabel(type: string, redFlag: boolean): string {
  if (redFlag) {
    return `${type.toUpperCase()} / ALERTA`;
  }
  return type.toUpperCase();
}
