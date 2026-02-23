import { PrismaClient } from '@prisma/client';
import { CourtService } from '../../../src/modules/courts/court.service';
import { NotFoundError } from '../../../src/shared/errors/app-error';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        court: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        reservation: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

describe('CourtService', () => {
    let courtService: CourtService;
    let prisma: any;

    beforeEach(() => {
        courtService = new CourtService();
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('createCourt', () => {
        it('should create a new court successfully', async () => {
            // Arrange
            const mockCourt = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Cancha Test',
                active: true,
                createdAt: new Date(),
            };
            prisma.court.create.mockResolvedValue(mockCourt);

            // Act
            const result = await courtService.createCourt('Cancha Test');

            // Assert
            expect(prisma.court.create).toHaveBeenCalledWith({
                data: {
                    name: 'Cancha Test',
                    active: true,
                },
            });
            expect(result).toEqual(mockCourt);
        });

        it('should create court with active=true by default', async () => {
            // Arrange
            const mockCourt = {
                id: '123',
                name: 'Cancha 1',
                active: true,
                createdAt: new Date(),
            };
            prisma.court.create.mockResolvedValue(mockCourt);

            // Act
            await courtService.createCourt('Cancha 1');

            // Assert
            expect(prisma.court.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        active: true,
                    }),
                })
            );
        });
    });

    describe('listCourts', () => {
        it('should return all active courts', async () => {
            // Arrange
            const mockCourts = [
                { id: '1', name: 'Cancha 1', active: true, createdAt: new Date() },
                { id: '2', name: 'Cancha 2', active: true, createdAt: new Date() },
            ];
            prisma.court.findMany.mockResolvedValue(mockCourts);

            // Act
            const result = await courtService.listCourts();

            // Assert
            expect(prisma.court.findMany).toHaveBeenCalledWith({
                where: { active: true },
                orderBy: { name: 'asc' },
            });
            expect(result).toEqual(mockCourts);
        });

        it('should exclude inactive courts', async () => {
            // Arrange
            prisma.court.findMany.mockResolvedValue([]);

            // Act
            await courtService.listCourts();

            // Assert
            expect(prisma.court.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { active: true },
                })
            );
        });
    });

    describe('getCourtAvailability', () => {
        const mockCourtId = '123e4567-e89b-12d3-a456-426614174000';
        const testDate = '2026-01-31';

        it('should throw NotFoundError when court does not exist', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(courtService.getCourtAvailability(mockCourtId, testDate)).rejects.toThrow(
                NotFoundError
            );
            await expect(courtService.getCourtAvailability(mockCourtId, testDate)).rejects.toThrow('Court');
        });

        it('should generate correct time slots for a day', async () => {
            // Arrange
            const mockCourt = { id: mockCourtId, name: 'Cancha 1', active: true, createdAt: new Date() };
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            prisma.reservation.findMany.mockResolvedValue([]);

            // Act
            const result = await courtService.getCourtAvailability(mockCourtId, testDate);

            // Assert
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('startTime');
            expect(result[0]).toHaveProperty('endTime');
            expect(result[0]).toHaveProperty('available');

            // Verify first slot starts at 8:00 AM
            const firstSlot = new Date(result[0].startTime);
            expect(firstSlot.getUTCHours()).toBe(8);
            expect(firstSlot.getUTCMinutes()).toBe(0);

            // Verify slots are 90 minutes apart
            const firstSlotEnd = new Date(result[0].endTime);
            const secondSlotStart = new Date(result[1].startTime);
            expect(firstSlotEnd.getTime()).toBe(secondSlotStart.getTime());
        });

        it('should mark all slots as available when no reservations exist', async () => {
            // Arrange
            const mockCourt = { id: mockCourtId, name: 'Cancha 1', active: true, createdAt: new Date() };
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            prisma.reservation.findMany.mockResolvedValue([]);

            // Act
            const result = await courtService.getCourtAvailability(mockCourtId, testDate);

            // Assert
            expect(result.every((slot) => slot.available)).toBe(true);
        });

        it('should mark slots as unavailable when reservation exists', async () => {
            // Arrange
            const mockCourt = { id: mockCourtId, name: 'Cancha 1', active: true, createdAt: new Date() };
            prisma.court.findUnique.mockResolvedValue(mockCourt);

            // Reservation from 8:00 to 9:30
            const reservation = {
                startTime: new Date(`${testDate}T08:00:00.000Z`),
                endTime: new Date(`${testDate}T09:30:00.000Z`),
            };
            prisma.reservation.findMany.mockResolvedValue([reservation]);

            // Act
            const result = await courtService.getCourtAvailability(mockCourtId, testDate);

            // Assert
            // First slot (8:00-9:30) should be unavailable
            expect(result[0].available).toBe(false);
            // Other slots should be available
            expect(result[1].available).toBe(true);
        });

        it('should handle overlapping reservations correctly', async () => {
            // Arrange
            const mockCourt = { id: mockCourtId, name: 'Cancha 1', active: true, createdAt: new Date() };
            prisma.court.findUnique.mockResolvedValue(mockCourt);

            // Reservation that overlaps with first slot (starts at 7:30, ends at 8:30)
            const reservation = {
                startTime: new Date(`${testDate}T07:30:00.000Z`),
                endTime: new Date(`${testDate}T08:30:00.000Z`),
            };
            prisma.reservation.findMany.mockResolvedValue([reservation]);

            // Act
            const result = await courtService.getCourtAvailability(mockCourtId, testDate);

            // Assert
            // First slot (8:00-9:30) should be unavailable due to overlap
            expect(result[0].available).toBe(false);
        });

        it('should handle multiple reservations', async () => {
            // Arrange
            const mockCourt = { id: mockCourtId, name: 'Cancha 1', active: true, createdAt: new Date() };
            prisma.court.findUnique.mockResolvedValue(mockCourt);

            const reservations = [
                {
                    startTime: new Date(`${testDate}T08:00:00.000Z`),
                    endTime: new Date(`${testDate}T09:30:00.000Z`),
                },
                {
                    startTime: new Date(`${testDate}T11:00:00.000Z`),
                    endTime: new Date(`${testDate}T12:30:00.000Z`),
                },
            ];
            prisma.reservation.findMany.mockResolvedValue(reservations);

            // Act
            const result = await courtService.getCourtAvailability(mockCourtId, testDate);

            // Assert
            // First slot (8:00-9:30) should be unavailable
            expect(result[0].available).toBe(false);
            // Second slot (9:30-11:00) should be available
            expect(result[1].available).toBe(true);
            // Third slot (11:00-12:30) should be unavailable
            expect(result[2].available).toBe(false);
        });
    });
});
