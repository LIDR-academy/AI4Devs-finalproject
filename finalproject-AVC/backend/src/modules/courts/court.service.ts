import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error';
import { config } from '../../shared/config';
import { TimeSlot } from './court.schemas';

const prisma = new PrismaClient();

export class CourtService {
    /**
     * Create a new court
     * @param name - Court name
     * @returns Created court
     */
    async createCourt(name: string) {
        const court = await prisma.court.create({
            data: {
                name,
                active: true,
            },
        });

        return court;
    }

    /**
     * List all active courts
     * @returns Array of active courts
     */
    async listCourts() {
        const courts = await prisma.court.findMany({
            where: {
                active: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return courts;
    }

    /**
     * Get availability for a court on a specific date
     * @param courtId - Court ID
     * @param date - Date in YYYY-MM-DD format
     * @returns Array of time slots with availability status
     * @throws NotFoundError if court doesn't exist
     */
    async getCourtAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
        // Verify court exists
        const court = await prisma.court.findUnique({
            where: { id: courtId },
        });

        if (!court) {
            throw new NotFoundError('Court');
        }

        // Parse date and generate time slots
        const timeSlots = this.generateTimeSlots(date);

        // Get reservations for this court on this date
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const reservations = await prisma.reservation.findMany({
            where: {
                courtId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });

        // Mark slots as unavailable if they overlap with reservations
        const slotsWithAvailability = timeSlots.map((slot) => {
            const slotStart = new Date(slot.startTime);
            const slotEnd = new Date(slot.endTime);

            const hasOverlap = reservations.some((reservation) => {
                // Check if slot overlaps with reservation
                // Overlap if: (slot.start < reservation.end) AND (slot.end > reservation.start)
                return slotStart < reservation.endTime && slotEnd > reservation.startTime;
            });

            return {
                ...slot,
                available: !hasOverlap,
            };
        });

        return slotsWithAvailability;
    }

    /**
     * Generate time slots for a given date
     * @param date - Date in YYYY-MM-DD format
     * @returns Array of time slots
     */
    private generateTimeSlots(date: string): TimeSlot[] {
        const slots: TimeSlot[] = [];
        const { businessHoursStart, businessHoursEnd, slotDurationMinutes } = config.court;

        // Create date object for the given date
        const baseDate = new Date(`${date}T00:00:00.000Z`);

        // Generate slots from business hours start to end
        let currentHour = businessHoursStart;
        let currentMinute = 0;

        while (currentHour < businessHoursEnd) {
            // Create start time
            const startTime = new Date(baseDate);
            startTime.setUTCHours(currentHour, currentMinute, 0, 0);

            // Create end time
            const endTime = new Date(startTime);
            endTime.setUTCMinutes(endTime.getUTCMinutes() + slotDurationMinutes);

            // Only add slot if end time is within business hours
            if (endTime.getUTCHours() <= businessHoursEnd) {
                slots.push({
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    available: true, // Default to available, will be updated later
                });
            }

            // Move to next slot
            currentMinute += slotDurationMinutes;
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute = currentMinute % 60;
            }
        }

        return slots;
    }
}

export const courtService = new CourtService();
