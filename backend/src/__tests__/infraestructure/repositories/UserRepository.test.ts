import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { User } from '../../../domain/models/User';

jest.mock('../../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  it('should find a user by id', async () => {
    const mockUser = new User();
    mockUser.id = '1';
    (userRepository['repository'].findOne as jest.Mock).mockResolvedValue(mockUser);

    const user = await userRepository.findById('1');
    expect(user).toEqual(mockUser);
  });

  it('should save a user', async () => {
    const mockUser = new User();
    (userRepository['repository'].save as jest.Mock).mockResolvedValue(mockUser);

    const user = await userRepository.save(mockUser);
    expect(user).toEqual(mockUser);
  });
});