function formatDateTime(date: Date): string {
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} at ${timeStr}`;
}

export function renderNewClassAvailable(
  levelName: string,
  dateTime: Date,
  coachName: string,
): string {
  return `New ${levelName} group class available on ${formatDateTime(dateTime)} with Coach ${coachName}. Spots open!`;
}

export function renderIndividualClassAssigned(
  coacheeName: string,
  dateTime: Date,
  levelName: string,
  coachName: string,
): string {
  return `Individual class with ${coacheeName} assigned on ${formatDateTime(dateTime)} — ${levelName} with Coach ${coachName}.`;
}

export function renderClassCanceled(
  levelName: string,
  classType: string,
  dateTime: Date,
  coachName: string,
): string {
  return `Your ${levelName} ${classType.toLowerCase()} class on ${formatDateTime(dateTime)} with Coach ${coachName} has been canceled.`;
}

export function renderCoachAssigned(levelName: string, classType: string, dateTime: Date): string {
  return `You have been assigned to a ${levelName} ${classType.toLowerCase()} class on ${formatDateTime(dateTime)}.`;
}
