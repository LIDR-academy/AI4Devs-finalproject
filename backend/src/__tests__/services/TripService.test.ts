import { TripService } from '../../services/TripService';
import { TripRepository } from '../../infrastructure/repositories/TripRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Trip } from '../../domain/models/Trip';
import { User } from '../../domain/models/User';

jest.mock('../../infrastructure/repositories/TripRepository');
jest.mock('../../infrastructure/repositories/UserRepository');

describe('TripService', () => {
  let tripService: TripService;
  let tripRepository: jest.Mocked<TripRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    tripRepository = new TripRepository() as jest.Mocked<TripRepository>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    tripService = new TripService(tripRepository, userRepository);
  });

  it('should create a trip', async () => {
    const mockUser = new User();
    mockUser.id = '1';
    userRepository.findBySessionId.mockResolvedValue(mockUser);

    const mockTrip = new Trip();
    tripRepository.save.mockResolvedValue(mockTrip);

    const tripData = { destination: 'Paris' };
    const trip = await tripService.createTrip(tripData, 'valid-session-id');
    expect(trip).toEqual(mockTrip);
  });

  it('should get a trip by id', async () => {
    const mockTrip = new Trip();
    mockTrip.id = '1';
    tripRepository.findById.mockResolvedValue(mockTrip);

    const trip = await tripService.getTripById('1');
    expect(trip).toEqual(mockTrip);
  });
});