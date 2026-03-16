import { TripRepository } from '../../../infrastructure/repositories/TripRepository';
import { Trip } from '../../../domain/models/Trip';

jest.mock('../../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    }),
  },
}));

describe('TripRepository', () => {
  let tripRepository: TripRepository;

  beforeEach(() => {
    tripRepository = new TripRepository();
  });

  it('should find a trip by id', async () => {
    const mockTrip = new Trip();
    mockTrip.id = '1';
    (tripRepository['repository'].findOne as jest.Mock).mockResolvedValue(mockTrip);

    const trip = await tripRepository.findById('1');
    expect(trip).toEqual(mockTrip);
  });

  it('should save a trip', async () => {
    const mockTrip = new Trip();
    (tripRepository['repository'].save as jest.Mock).mockResolvedValue(mockTrip);

    const trip = await tripRepository.save(mockTrip);
    expect(trip).toEqual(mockTrip);
  });
});