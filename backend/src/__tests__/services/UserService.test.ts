import { UserService } from '../../services/UserService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { User } from '../../domain/models/User';

jest.mock('../../infrastructure/repositories/UserRepository');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(userRepository);
  });

  it('should get user by id', async () => {
    const mockUser = new User();
    mockUser.id = '1';
    userRepository.findById.mockResolvedValue(mockUser);

    const user = await userService.getUserById('1');
    expect(user).toEqual(mockUser);
  });

  it('should create a user', async () => {
    const mockUser = new User();
    mockUser.sessionId = 'session-id';
    userRepository.save.mockResolvedValue(mockUser);

    const user = await userService.createUser('session-id');
    expect(user).toEqual(mockUser);
  });
});