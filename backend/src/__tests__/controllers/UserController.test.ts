import { UserController } from '../../controllers/UserController';
import { UserService } from '../../services/UserService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/UserService');
jest.mock('../../infrastructure/repositories/UserRepository');

describe('UserController', () => {
    let userController: UserController;
    let userService: jest.Mocked<UserService>;
    let userRepository: jest.Mocked<UserRepository>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        userService = new UserService(userRepository) as jest.Mocked<UserService>;
        userController = new UserController();
        userController['userService'] = userService;

        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
        };
        next = jest.fn();
    });

    it('should get user by id', async () => {
        const mockUser = {
            id: '1',
            sessionId: 'session-id',
            creationDate: new Date(),
            lastLogin: new Date(),
            trips: []
        };
        userService.getUserById.mockResolvedValue(mockUser);
        req.params = { id: '1' };

        await userController.getUserById(req as Request, res as Response, next);

        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should create a user', async () => {
        const mockUser = {
            id: '1',
            sessionId: 'session-id',
            creationDate: new Date(),
            lastLogin: new Date(),
            trips: []
        };
        userService.createUser.mockResolvedValue(mockUser);
        req.body = { sessionId: 'session-id' };

        await userController.createUser(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUser);
        expect(res.cookie).toHaveBeenCalledWith('sessionId', 'session-id', { httpOnly: true });
    });
});