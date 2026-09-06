import { ConflictException, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

describe('ClientsService', () => {
  let clientsService: ClientsService;
  let prisma: {
    client: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const juanClient: Client = {
    id: 'client-1',
    fullName: 'Juan Pérez',
    nationalId: '1-2345-6789',
    phone: '88887777',
    email: 'juan@email.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mariaClient: Client = {
    id: 'client-2',
    fullName: 'María López',
    nationalId: '2-3456-7890',
    phone: '77776666',
    email: null,
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
  };

  beforeEach(() => {
    prisma = {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    clientsService = new ClientsService(prisma as unknown as PrismaService);
  });

  describe('search', () => {
    it('returns matches for fullName fragment case-insensitively', async () => {
      prisma.client.findMany.mockResolvedValue([juanClient]);

      const result = await clientsService.search({ q: 'juan' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].fullName).toBe('Juan Pérez');
      expect(result.total).toBe(1);
      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                fullName: { contains: 'juan', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });

    it('returns client when q matches phone digits', async () => {
      prisma.client.findMany.mockResolvedValue([juanClient]);

      const result = await clientsService.search({ q: '88887777' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].phone).toBe('88887777');
    });

    it('returns single result for exact nationalId search', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.client.findMany.mockResolvedValue([]);

      const result = await clientsService.search({
        nationalId: '1-2345-6789',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].nationalId).toBe('1-2345-6789');
    });

    it('returns empty array when nationalId has no match', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.findMany.mockResolvedValue([]);

      const result = await clientsService.search({
        nationalId: '9-9999-9999',
      });

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('returns empty array when q has no matches', async () => {
      prisma.client.findMany.mockResolvedValue([]);

      const result = await clientsService.search({ q: 'zzzz' });

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('returns empty array when q is shorter than 2 characters', async () => {
      const result = await clientsService.search({ q: 'a' });

      expect(result).toEqual({ items: [], total: 0 });
      expect(prisma.client.findMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates client with normalized email and optional fields', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.create.mockResolvedValue({
        ...juanClient,
        id: 'new-client',
        email: 'juan@email.com',
      });

      const dto: CreateClientDto = {
        fullName: '  Juan   Pérez  ',
        nationalId: '1-2345-6789',
        phone: '88887777',
        email: '  JUAN@EMAIL.COM ',
      };

      const result = await clientsService.create(dto);

      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Juan Pérez',
          nationalId: '1-2345-6789',
          phone: '88887777',
          email: 'juan@email.com',
        },
      });
      expect(result.fullName).toBe('Juan Pérez');
      expect(result.email).toBe('juan@email.com');
    });

    it('stores null when optional phone and email are omitted', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.create.mockResolvedValue({
        ...mariaClient,
        phone: null,
        email: null,
      });

      const result = await clientsService.create({
        fullName: 'María López',
        nationalId: '2-3456-7890',
      });

      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          fullName: 'María López',
          nationalId: '2-3456-7890',
          phone: null,
          email: null,
        },
      });
      expect(result.phone).toBeNull();
      expect(result.email).toBeNull();
    });

    it('throws conflict with existingClient for duplicate nationalId', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.client.findMany.mockResolvedValue([]);

      await expect(
        clientsService.create({
          fullName: 'Another Juan',
          nationalId: '1-2345-6789',
        }),
      ).rejects.toMatchObject({
        response: {
          message: 'Client with this national ID already exists',
          existingClient: expect.objectContaining({
            id: 'client-1',
            nationalId: '1-2345-6789',
          }),
        },
      });
      expect(prisma.client.create).not.toHaveBeenCalled();
    });

    it('handles Prisma P2002 race with conflict response', async () => {
      prisma.client.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(juanClient);
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );

      await expect(
        clientsService.create({
          fullName: 'Race Client',
          nationalId: '1-2345-6789',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows two clients with the same email', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.create.mockResolvedValue({
        ...mariaClient,
        id: 'client-3',
        email: 'shared@email.com',
      });

      const result = await clientsService.create({
        fullName: 'María López',
        nationalId: '3-4567-8901',
        email: 'shared@email.com',
      });

      expect(result.email).toBe('shared@email.com');
    });
  });

  describe('findById', () => {
    it('returns client DTO for valid id', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);

      const result = await clientsService.findById('client-1');

      expect(result.id).toBe('client-1');
      expect(result.fullName).toBe('Juan Pérez');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.findById('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates contact fields without changing nationalId', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.client.update.mockResolvedValue({
        ...juanClient,
        fullName: 'Juan P. Pérez',
        phone: '99998888',
        email: 'juan.perez@email.com',
      });

      const result = await clientsService.update('client-1', {
        fullName: '  Juan   P. Pérez  ',
        phone: '99998888',
        email: 'JUAN.PEREZ@EMAIL.COM',
      });

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: {
          fullName: 'Juan P. Pérez',
          phone: '99998888',
          email: 'juan.perez@email.com',
        },
      });
      expect(result.fullName).toBe('Juan P. Pérez');
      expect(result.nationalId).toBe('1-2345-6789');
    });

    it('clears optional phone and email when omitted', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.client.update.mockResolvedValue({
        ...juanClient,
        phone: null,
        email: null,
      });

      await clientsService.update('client-1', {
        fullName: 'Juan Pérez',
      });

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: {
          fullName: 'Juan Pérez',
          phone: null,
          email: null,
        },
      });
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.update('00000000-0000-4000-8000-000000000099', {
          fullName: 'Missing Client',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findByNationalId', () => {
    it('matches nationalId ignoring spaces and hyphens', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.findMany.mockResolvedValue([juanClient]);

      const result = await clientsService.findByNationalId('123456789');

      expect(result?.id).toBe('client-1');
    });
  });
});
