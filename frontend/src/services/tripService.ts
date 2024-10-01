import { apiFetch } from '../utils/api';

export const getTrip = async (tripId: string) => {
  return await apiFetch(`/trips/${tripId}`, {
    method: 'GET',
  });
};

export const getRecentTrips = async () => {
  return await apiFetch('/trips/recent', {
    method: 'GET',
  });
};

export const saveTrip = async (tripData: any) => {
  if (tripData.id) {
    return await apiFetch(`/trips/${tripData.id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  } else {
    return await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }
};

export const saveTripActivities = async (tripId: string, activities: string[]) => {
  return await apiFetch(`/trips/${tripId}/activities/all`, {
    method: 'POST',
    body: JSON.stringify({ activities }),
  });
};
