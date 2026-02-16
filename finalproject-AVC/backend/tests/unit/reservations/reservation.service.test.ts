import { PrismaClient } from '@prisma/client';
import { ReservationService } from '../../../src/modules/reservations/reservation.service';
import { NotFoundError, ConflictError, ValidationError } from '../../../src/shared/errors/app-error';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        court: {
            findUnique: jest.fn(),
        },
        reservation: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        ReservationStatus: {
            CREATED: 'CREATED',
            CONFIRMED: 'CONFIRMED',
        },
    };
});

describe('ReservationService', () => {
    let reservationService: ReservationService;
    let prisma: any;

    beforeEach(() => {
        reservationService = new ReservationService();
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('createReservation', () => {
        const mockCourt = {
            id: 'court-123',
            name: 'Cancha 1',
            active: true,
            createdAt: new Date(),
        };

        const mockReservation = {
            id: 'reservation-123',
            courtId: 'court-123',
            userId: 'user-123',
            startTime: new Date('2026-02-15T08:00:00.000Z'),
            endTime: new Date('2026-02-15T09:30:00.000Z'),
            status: 'CREATED',
            createdAt: new Date(),
            court: {
                id: 'court-123',
                name: 'Cancha 1',
            },
        };

        it('should create reservation successfully when no overlap', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            prisma.reservation.findMany.mockResolvedValue([]);
            prisma.reservation.create.mockResolvedValue(mockReservation);

            // Act
            const result = await reservationService.createReservation(
                'user-123',
                'court-123',
                '2026-02-15T08:00:00.000Z',
                '2026-02-15T09:30:00.000Z'
            );

            // Assert
            expect(prisma.court.findUnique).toHaveBeenCalledWith({
                where: { id: 'court-123' },
            });
            expect(prisma.reservation.findMany).toHaveBeenCalled();
            expect(prisma.reservation.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-123',
                    courtId: 'court-123',
                    startTime: new Date('2026-02-15T08:00:00.000Z'),
                    endTime: new Date('2026-02-15T09:30:00.000Z'),
                    status: 'CREATED',
                },
                include: {
                    court: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            expect(result).toEqual(mockReservation);
        });

        it('should throw NotFoundError when court does not exist', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'nonexistent-court',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow(NotFoundError);
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'nonexistent-court',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow('Court');
        });

        it('should throw ValidationError when court is not active', async () => {
            // Arrange
            const inactiveCourt = { ...mockCourt, active: false };
            prisma.court.findUnique.mockResolvedValue(inactiveCourt);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow(ValidationError);
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow('Court is not active');
        });

        it('should throw ValidationError when endTime is before startTime', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T09:30:00.000Z',
                    '2026-02-15T08:00:00.000Z'
                )
            ).rejects.toThrow(ValidationError);
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T09:30:00.000Z',
                    '2026-02-15T08:00:00.000Z'
                )
            ).rejects.toThrow('End time must be after start time');
        });

        it('should throw ConflictError when reservation overlaps', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                id: 'existing-123',
                courtId: 'court-123',
                userId: 'other-user',
                startTime: new Date('2026-02-15T08:00:00.000Z'),
                endTime: new Date('2026-02-15T09:30:00.000Z'),
                status: 'CREATED',
                createdAt: new Date(),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:30:00.000Z',
                    '2026-02-15T10:00:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:30:00.000Z',
                    '2026-02-15T10:00:00.000Z'
                )
            ).rejects.toThrow('This time slot is already reserved');
        });

        it('should create reservation with status CREATED', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            prisma.reservation.findMany.mockResolvedValue([]);
            prisma.reservation.create.mockResolvedValue(mockReservation);

            // Act
            await reservationService.createReservation(
                'user-123',
                'court-123',
                '2026-02-15T08:00:00.000Z',
                '2026-02-15T09:30:00.000Z'
            );

            // Assert
            expect(prisma.reservation.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'CREATED',
                    }),
                })
            );
        });

        it('should handle edge case: exact same time range', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                startTime: new Date('2026-02-15T08:00:00.000Z'),
                endTime: new Date('2026-02-15T09:30:00.000Z'),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('should handle edge case: new reservation starts during existing', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                startTime: new Date('2026-02-15T08:00:00.000Z'),
                endTime: new Date('2026-02-15T09:30:00.000Z'),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T09:00:00.000Z',
                    '2026-02-15T10:30:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('should handle edge case: new reservation ends during existing', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                startTime: new Date('2026-02-15T08:00:00.000Z'),
                endTime: new Date('2026-02-15T09:30:00.000Z'),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T07:00:00.000Z',
                    '2026-02-15T08:30:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('should handle edge case: new reservation completely contains existing', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                startTime: new Date('2026-02-15T08:30:00.000Z'),
                endTime: new Date('2026-02-15T09:00:00.000Z'),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:00:00.000Z',
                    '2026-02-15T09:30:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('should handle edge case: new reservation completely contained by existing', async () => {
            // Arrange
            prisma.court.findUnique.mockResolvedValue(mockCourt);
            const existingReservation = {
                startTime: new Date('2026-02-15T08:00:00.000Z'),
                endTime: new Date('2026-02-15T10:00:00.000Z'),
            };
            prisma.reservation.findMany.mockResolvedValue([existingReservation]);

            // Act & Assert
            await expect(
                reservationService.createReservation(
                    'user-123',
                    'court-123',
                    '2026-02-15T08:30:00.000Z',
                    '2026-02-15T09:00:00.000Z'
                )
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('getUserReservations', () => {
        it('should return user reservations with court details', async () => {
            // Arrange
            const mockReservations = [
                {
                    id: 'res-1',
                    courtId: 'court-1',
                    userId: 'user-123',
                    startTime: new Date('2026-02-15T08:00:00.000Z'),
                    endTime: new Date('2026-02-15T09:30:00.000Z'),
                    status: 'CREATED',
                    createdAt: new Date(),
                    court: {
                        id: 'court-1',
                        name: 'Cancha 1',
                    },
                },
            ];
            prisma.reservation.findMany.mockResolvedValue(mockReservations);

            // Act
            const result = await reservationService.getUserReservations('user-123');

            // Assert
            expect(prisma.reservation.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                include: {
                    court: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    startTime: 'desc',
                },
            });
            expect(result).toEqual(mockReservations);
        });

        it('should return empty array when user has no reservations', async () => {
            // Arrange
            prisma.reservation.findMany.mockResolvedValue([]);

            // Act
            const result = await reservationService.getUserReservations('user-123');

            // Assert
            expect(result).toEqual([]);
        });

        it('should order reservations by startTime descending', async () => {
            // Arrange
            prisma.reservation.findMany.mockResolvedValue([]);

            // Act
            await reservationService.getUserReservations('user-123');

            // Assert
            expect(prisma.reservation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: {
                        startTime: 'desc',
                    },
                })
            );
        });
    });
});
