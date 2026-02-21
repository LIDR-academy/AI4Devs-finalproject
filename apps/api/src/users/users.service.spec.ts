import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockBuyerDto } from '../mock/dto/create-mock-order.dto';

const mockPrisma = {
  phone: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const buyer: MockBuyerDto = {
  first_name: 'Ana',
  last_name: 'García',
  phone: '+34600123456',
  email: 'ana@example.com',
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findOrCreateByPhone', () => {
    it('creates a new phone and user when neither exist', async () => {
      mockPrisma.phone.findUnique.mockResolvedValue(null);
      mockPrisma.phone.create.mockResolvedValue({ id: 'phone-1', e164: '+34600123456' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      const result = await service.findOrCreateByPhone(buyer);

      expect(mockPrisma.phone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          e164: '+34600123456',
          countryCallingCode: '34',
          nationalNumber: '600123456',
          country: 'ES',
          isValid: true,
        }),
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneId: 'phone-1',
          firstName: 'Ana',
          lastName: 'García',
          email: 'ana@example.com',
        }),
      });
      expect(result).toEqual({ id: 'user-1', phoneId: 'phone-1' });
    });

    it('creates a user when phone exists but user does not', async () => {
      mockPrisma.phone.findUnique.mockResolvedValue({ id: 'phone-existing', e164: '+34600123456' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

      const result = await service.findOrCreateByPhone(buyer);

      expect(mockPrisma.phone.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneId: 'phone-existing',
          firstName: 'Ana',
          lastName: 'García',
        }),
      });
      expect(result).toEqual({ id: 'user-new', phoneId: 'phone-existing' });
    });

    it('updates existing user and returns ids when both phone and user exist', async () => {
      const existingUser = { id: 'user-existing', email: 'old@example.com' };
      mockPrisma.phone.findUnique.mockResolvedValue({ id: 'phone-existing' });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({ ...existingUser, firstName: 'Ana' });

      const result = await service.findOrCreateByPhone(buyer);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-existing' },
        data: expect.objectContaining({
          firstName: 'Ana',
          lastName: 'García',
          email: 'ana@example.com',
          lastInteractionAt: expect.any(Date),
        }),
      });
      expect(result).toEqual({ id: 'user-existing', phoneId: 'phone-existing' });
    });

    it('preserves existing email when buyer email is undefined', async () => {
      const existingUser = { id: 'user-existing', email: 'existing@example.com' };
      mockPrisma.phone.findUnique.mockResolvedValue({ id: 'phone-1' });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(existingUser);

      await service.findOrCreateByPhone({ ...buyer, email: undefined });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'existing@example.com',
          }),
        }),
      );
    });

    it('handles phone number without + prefix', async () => {
      mockPrisma.phone.findUnique.mockResolvedValue(null);
      mockPrisma.phone.create.mockResolvedValue({ id: 'phone-1', e164: '+34600000001' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      await service.findOrCreateByPhone({ ...buyer, phone: '34600000001' });

      expect(mockPrisma.phone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          e164: '+34600000001',
        }),
      });
    });

    it('parses French phone number correctly', async () => {
      mockPrisma.phone.findUnique.mockResolvedValue(null);
      mockPrisma.phone.create.mockResolvedValue({ id: 'phone-fr', e164: '+33612345678' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-fr' });

      await service.findOrCreateByPhone({ ...buyer, phone: '+33612345678' });

      expect(mockPrisma.phone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          e164: '+33612345678',
          countryCallingCode: '33',
          country: 'FR',
        }),
      });
    });
  });
});
