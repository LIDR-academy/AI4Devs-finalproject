export function saveCurrentTripId(tripId: string) {
  localStorage.setItem('currentTripId', tripId);
}

export function getCurrentTripId(): string | null {
  return localStorage.getItem('currentTripId');
}

export function removeCurrentTripId() {
  localStorage.removeItem('currentTripId');
}