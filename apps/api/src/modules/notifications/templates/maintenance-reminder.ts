function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type MaintenanceReminderEmailInput = {
  ownerFullName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  daysSinceVisit: number;
  workshopName: string;
  workshopPhone?: string | null;
};

export function buildMaintenanceReminderEmail(
  input: MaintenanceReminderEmailInput,
): { subject: string; html: string; text: string } {
  const owner = escapeHtml(input.ownerFullName);
  const plate = escapeHtml(input.licensePlate);
  const brand = escapeHtml(input.brand);
  const model = escapeHtml(input.model);
  const workshop = escapeHtml(input.workshopName);
  const phone = input.workshopPhone
    ? escapeHtml(input.workshopPhone)
    : null;

  const subject = `Te esperamos de nuevo — mantenimiento ${input.licensePlate} | ${input.workshopName}`;

  const textLines = [
    `Hola ${input.ownerFullName},`,
    '',
    `Han pasado aproximadamente ${input.daysSinceVisit} días desde la última visita de su vehículo ${input.brand} ${input.model} (${input.year}), placa ${input.licensePlate}.`,
    '',
    `En ${input.workshopName} lo invitamos a agendar su próximo mantenimiento preventivo.`,
    phone ? `Teléfono: ${input.workshopPhone}` : null,
    '',
    '¡Esperamos verlo pronto!',
  ].filter((line): line is string => line !== null);

  const html = `
<p>Hola ${owner},</p>
<p>Han pasado aproximadamente <strong>${input.daysSinceVisit}</strong> días desde la última visita de su vehículo <strong>${brand} ${model} (${input.year})</strong>, placa <strong>${plate}</strong>.</p>
<p>En <strong>${workshop}</strong> lo invitamos a agendar su próximo mantenimiento preventivo.</p>
${phone ? `<p>Teléfono: ${phone}</p>` : ''}
<p>¡Esperamos verlo pronto!</p>
`.trim();

  return { subject, html, text: textLines.join('\n') };
}
