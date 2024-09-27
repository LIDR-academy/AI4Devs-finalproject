import { validate } from 'class-validator';
import { Trip } from '../../../domain/models/Trip';
import { User } from '../../../domain/models/User';

describe('Trip Model', () => {
  it('should validate a valid trip', async () => {
    const user = new User();
    user.id = '1';
    user.sessionId = 'valid-session-id';
    user.creationDate = new Date();

    const trip = new Trip();
    trip.user = user;
    trip.destination = 'Paris';
    trip.startDate = new Date();
    trip.endDate = new Date();
    trip.description = 'A trip to Paris';
    trip.activityCount = 0;
    trip.accompaniment = ['Friend'];
    trip.activityType = ['Sightseeing'];
    trip.budgetMax = 1000;

    const errors = await validate(trip);
    expect(errors.length).toBe(0);
  });

  it('should not validate a trip without a destination', async () => {
    const user = new User();
    user.id = '1';
    user.sessionId = 'valid-session-id';
    user.creationDate = new Date();

    const trip = new Trip();
    trip.user = user;

    const errors = await validate(trip);
    expect(errors.length).toBeGreaterThan(0);
  });
});