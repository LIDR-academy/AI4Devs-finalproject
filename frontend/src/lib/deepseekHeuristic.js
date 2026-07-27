// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

// Heuristica: sugiere la variante optima de DeepSeek V4 segun el contenido del prompt.
// Devuelve "pro" | "flash" | null  (null = sin opinion).
// Pensada para ser identica entre AI Assistant, ProjectDetailPage y SummaryLlmDialog.
export const suggestDeepseekVariant = (text) => {
  if (!text) return null;
  const t = text.trim();
  if (t.length < 4) return null;

  const len = t.length;
  const lower = t.toLowerCase();

  const proSignals = [
    /\brefactor(iz|a)/,
    /\banaliz(a|ar|ame)/,
    /\barquitectura\b/,
    /\bauditor(ia|ía)/,
    /\bdise(ñ|n)a /,
    /\bplanific(a|ar)/,
    /\bmigra(r|cion|ción)/,
    /\bbenchmark/,
    /\bcomparati(va|vo)/,
    /\bsolucion completa/,
    /\b(pro y contra|trade.?off)/,
    /\bcomplejid/,
    /\bestrategia\b/,
    /\bcasos de uso\b.*(complej|todos|exhaustiv)/,
    /\bcompleto y detallado/,
    /\bproduccion\b/,
  ];
  const flashSignals = [
    /^(que|qué|que es|cual|cómo|como) /,
    /^(hola|buenas|saludos)/,
    /^genera 1 /,
    /^dame 1 ejemplo/,
    /^en (1|una) (linea|línea|frase|palabra)/,
    /^resume en /,
    /^dime el /,
    /^explica brevemente/,
    /^(haz|da) un (saludo|resumen corto)/,
  ];

  const hasProSignal = proSignals.some(rx => rx.test(lower));
  const hasFlashSignal = flashSignals.some(rx => rx.test(lower));

  if (len > 500) return "pro";
  if (hasProSignal) return "pro";
  if (hasFlashSignal) return "flash";
  if (len < 80) return "flash";
  return null;
};

// Texto del nudge — se reusa para mantener UX consistente entre vistas.
export const NUDGE_COPY = {
  flash: "Consulta rapida — Flash responde en ~3s y cuesta menos. Pro es excesivo para esto.",
  pro: "Consulta compleja — Pro tiene mejor razonamiento profundo. Flash puede quedarse corto.",
};
