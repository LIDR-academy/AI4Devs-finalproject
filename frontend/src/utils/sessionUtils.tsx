import { TripInfo } from '../types/global';

export function saveCurrentTripId(tripId: string) {
  localStorage.setItem('currentTripId', tripId);
}

export function getCurrentTripId(): string | null {
  return localStorage.getItem('currentTripId');
}

export function removeCurrentTripId() {
  localStorage.removeItem('currentTripId');
}

export function saveCurrentThreadId(threadId: string) {
  localStorage.setItem('currentThreadId', threadId);
}

export function getCurrentThreadId(): string | null {
  return localStorage.getItem('currentThreadId');
}

export function removeCurrentThreadId() {
  localStorage.removeItem('currentThreadId');
}

export function saveRecentTrips(trips: TripInfo[]) {
  localStorage.setItem('recentTrips', JSON.stringify(trips));
}

export function getRecentTrips(): TripInfo[] {
  const trips = localStorage.getItem('recentTrips');
  return trips ? JSON.parse(trips) : [];
}

export function addNewTrip(tripId: string, threadId: string) {
  const recentTrips = getRecentTrips();
  const newTrip = { tripId, threadId };
  const tripExists = recentTrips.some(trip => trip.tripId === tripId);

  if (!tripExists) {
    if (recentTrips.length >= 3) {
      recentTrips.pop();
    }

    recentTrips.unshift(newTrip);
    saveRecentTrips(recentTrips);
  }
}

export function clearSession() {
  const currentTripId = getCurrentTripId();
  const currentThreadId = getCurrentThreadId();

  if (currentTripId && currentThreadId) {
    addNewTrip(currentTripId, currentThreadId);
  }

  removeCurrentTripId();
  removeCurrentThreadId();
}