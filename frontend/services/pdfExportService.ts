import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { getCategoryColor, getCategoryLabel } from "@/components/categoryColors";
import { Passport } from "@/types/passport";
import { Patient } from "@/types/patient";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatGeneratedDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${now.getFullYear()}`;
}

function buildPassportId(patient: Patient): string {
  const year = new Date().getFullYear();
  const namePart = patient.fullName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "PAC";
  return `PAC-${year}-${namePart}`;
}

function buildCriticalAlertSection(passport: Passport): string {
  const flaggedEvent = passport.timeline.find((event) => event.redFlag);
  if (!flaggedEvent) return "";

  return `
    <div class="alert-box">
      <div class="alert-title">⚠ ATENCIÓN MÉDICA DE URGENCIA (CRITICAL ALERTS)</div>
      <div class="alert-body">
        <strong>${escapeHtml(flaggedEvent.title)}:</strong>
        ${escapeHtml(flaggedEvent.alertJustification ?? "")}
      </div>
    </div>
  `;
}

function buildBaselineSection(passport: Passport): string {
  if (passport.baseline.length === 0) {
    return `<p class="empty-note">Sin antecedentes crónicos registrados.</p>`;
  }

  const rows = passport.baseline
    .map((item) => {
      const isMedication = item.type.toLowerCase().includes("tratamiento");
      const chipClass = isMedication ? "chip chip-medication" : "chip chip-condition";
      return `
        <tr>
          <td><span class="${chipClass}">${escapeHtml(item.concept)}</span></td>
          <td>${escapeHtml(item.details ?? "")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table class="baseline-table">
      <thead>
        <tr>
          <th>CONDICIÓN / DIAGNÓSTICO / TRATAMIENTO</th>
          <th>NOTAS / POSOLOGÍA</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildTimelineSection(passport: Passport): string {
  if (passport.timeline.length === 0) {
    return `<p class="empty-note">Sin episodios registrados todavía.</p>`;
  }

  const cards = passport.timeline
    .map((event) => {
      const color = getCategoryColor(event.type);
      const label = getCategoryLabel(event.type, event.redFlag);
      const location = [event.medicalCenter, event.doctor].filter(Boolean).join(" | ");
      return `
        <div class="event-card">
          <div class="event-header">
            <span class="event-date">${escapeHtml(event.date)}</span>
            <span class="badge" style="background:${color.background};color:${color.text}">${escapeHtml(label)}</span>
          </div>
          <div class="event-title">${escapeHtml(event.title)}</div>
          <div class="event-summary">${escapeHtml(event.clinicalSummary)}</div>
          ${location ? `<div class="event-location">📍 ${escapeHtml(location)}</div>` : ""}
        </div>
      `;
    })
    .join("");

  return `<div class="timeline">${cards}</div>`;
}

function buildHtml(patient: Patient, passport: Passport): string {
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
        .header .subtitle { color: #64748b; font-size: 12px; letter-spacing: 0.5px; margin-top: 4px; }
        .header .meta { text-align: right; font-size: 11px; color: #475569; }
        .alert-box { background: #FEE2E2; border-left: 4px solid #DC2626; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; }
        .alert-title { font-weight: bold; color: #991B1B; margin-bottom: 6px; }
        .alert-body { font-size: 13px; color: #7f1d1d; }
        h2 { font-size: 15px; color: #1d4ed8; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .baseline-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .baseline-table th { text-align: left; font-size: 10px; color: #64748b; padding: 6px 8px; }
        .baseline-table td { padding: 8px; border-top: 1px solid #e2e8f0; font-size: 12px; vertical-align: top; }
        .chip { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
        .chip-condition { background: #DBEAFE; color: #1E40AF; }
        .chip-medication { background: #DCFCE7; color: #166534; }
        .event-card { border-left: 3px solid #cbd5e1; padding: 8px 0 8px 12px; margin-bottom: 14px; }
        .event-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .event-date { font-weight: bold; font-size: 12px; }
        .badge { font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 999px; }
        .event-title { font-weight: bold; font-size: 13px; margin-bottom: 4px; }
        .event-summary { font-size: 12px; color: #334155; }
        .event-location { font-size: 11px; color: #64748b; font-style: italic; margin-top: 4px; }
        .empty-note { color: #94a3b8; font-size: 12px; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>PASAPORTE MÉDICO DIGITAL</h1>
          <div class="subtitle">HISTORIAL CLÍNICO LONGITUDINAL AUMENTADO POR IA</div>
        </div>
        <div class="meta">
          <div><strong>ID:</strong> ${escapeHtml(buildPassportId(patient))}</div>
          <div><strong>Generado:</strong> ${formatGeneratedDate()}</div>
        </div>
      </div>

      ${buildCriticalAlertSection(passport)}

      <h2>1. PERFIL CLÍNICO BASE (CLINICAL BASELINE)</h2>
      ${buildBaselineSection(passport)}

      <h2>2. HISTORIAL CRONOLÓGICO DE EPISODIOS (CLINICAL TIMELINE)</h2>
      ${buildTimelineSection(passport)}

      <div class="footer">
        Este documento ha sido consolidado automáticamente mediante un sistema de Historial
        Digital Aumentado por IA a partir de transcripciones de voz e informes estructurados
        del paciente. Almacenamiento local seguro (Privacy by Design).
      </div>
    </body>
  </html>
  `;
}

export async function exportPassportPdf(patient: Patient, passport: Passport): Promise<void> {
  const html = buildHtml(patient, passport);
  const { uri } = await Print.printToFileAsync({ html });

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (isSharingAvailable) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
  }
}
