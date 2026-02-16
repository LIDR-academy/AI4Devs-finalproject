import { PrismaClient } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/app-error';

const prisma = new PrismaClient();

export class ReservationService {
    /**
     * Create a new reservation
     * @param userId - User ID creating the reservation
     * @param courtId - Court ID to reserve
     * @param startTime - Reservation start time (ISO string)
     * @param endTime - Reservation end time (ISO string)
     * @returns Created reservation with court details
     * @throws NotFoundError if court doesn't exist
     * @throws ConflictError if reservation overlaps with existing reservation
     * @throws ValidationError if times are invalid
     */
    async createReservation(userId: string, courtId: string, startTime: string, endTime: string) {
        // Validate court exists and is active
        const court = await prisma.court.findUnique({
            where: { id: courtId },
        });

        if (!court) {
            throw new NotFoundError('Court');
        }

        if (!court.active) {
            throw new ValidationError('Court is not active');
        }

        // Parse and validate times
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            throw new ValidationError('End time must be after start time');
        }

        // Check for overlapping reservations
        const overlappingReservations = await prisma.reservation.findMany({
            where: {
                courtId,
                AND: [
                    {
                        startTime: {
                            lt: end, // Existing reservation starts before new reservation ends
                        },
                    },
                    {
                        endTime: {
                            gt: start, // Existing reservation ends after new reservation starts
                        },
                    },
                ],
            },
        });

        if (overlappingReservations.length > 0) {
            throw new ConflictError('This time slot is already reserved');
        }

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId,
                courtId,
                startTime: start,
                endTime: end,
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

        return reservation;
    }

    /**
     * Get all reservations for a user
     * @param userId - User ID
     * @returns Array of user's reservations with court details
     */
    async getUserReservations(userId: string) {
        const reservations = await prisma.reservation.findMany({
            where: {
                userId,
            },
            include: {
                court: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                startTime: 'desc', // Most recent first
            },
        });

        return reservations;
    }
}

export const reservationService = new ReservationService();
