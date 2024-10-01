import { validate } from 'class-validator';
import { Activity } from '../../../domain/models/Activity';
import { Trip } from '../../../domain/models/Trip';

describe('Activity Model', () => {
  it('should validate a valid activity', async () => {
    const trip = new Trip();
    trip.id = '1';

    const activity = new Activity();
    activity.name = 'Visit Eiffel Tower';
    activity.sequence = 1;
    activity.trip = trip;

    const errors = await validate(activity);
    expect(errors.length).toBe(0);
  });

  it('should not validate an activity without a name', async () => {
    const trip = new Trip();
    trip.id = '1';

    const activity = new Activity();
    activity.sequence = 1;
    activity.trip = trip;

    const errors = await validate(activity);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should not validate an activity without a sequence', async () => {
    const trip = new Trip();
    trip.id = '1';

    const activity = new Activity();
    activity.name = 'Visit Eiffel Tower';
    activity.trip = trip;

    const errors = await validate(activity);
    expect(errors.length).toBeGreaterThan(0);
  });
});