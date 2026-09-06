export function formatElapsedLabel(checkedInAt: Date, now = new Date()): string {
  const diffMs = now.getTime() - checkedInAt.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0 && hours > 0) {
    return `${formatCount(days, 'día', 'días')} ${formatCount(hours, 'hora', 'horas')}`;
  }

  if (days > 0) {
    return formatCount(days, 'día', 'días');
  }

  if (hours > 0) {
    return formatCount(hours, 'hora', 'horas');
  }

  return formatCount(minutes, 'minuto', 'minutos');
}

function formatCount(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
