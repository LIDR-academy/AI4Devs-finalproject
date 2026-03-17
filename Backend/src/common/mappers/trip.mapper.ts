import { Trip } from '../../modules/trips/entities/trip.entity';
import { TripResponseDto } from '../../modules/trips/dto/trip-response.dto';
import { TripListItemDto } from '../../modules/trips/dto/trip-list-item.dto';
import {
  TripDetailResponseDto,
  ParticipantsPaginationMeta,
} from '../../modules/trips/dto/trip-detail-response.dto';
import { TripParticipantDto } from '../../modules/trips/dto/trip-participant.dto';
import { UserSummaryDto } from '../../modules/trips/dto/user-summary.dto';
import { ParticipantRole } from '../../modules/trips/enums/participant-role.enum';
import { TripParticipant } from '../../modules/trips/entities/trip-participant.entity';
import { User } from '../../modules/users/entities/user.entity';

/**
 * Mapper utility for converting Trip entities to DTOs.
 * Centralizes the mapping logic to avoid code duplication.
 */
export class TripMapper {
  /**
   * Maps a Trip entity to TripResponseDto.
   * Includes all public fields of the trip.
   *
   * @param trip - Trip entity to map
   * @returns TripResponseDto with public fields only
   */
  static toResponseDto(trip: Trip): TripResponseDto {
    return {
      id: trip.id,
      name: trip.name,
      currency: trip.currency,
      status: trip.status,
      code: trip.code,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  /**
   * Maps a Trip entity to TripListItemDto with additional metadata.
   * Used for list endpoints where we need to include user's role and participant count.
   *
   * @param trip - Trip entity to map
   * @param userRole - Role of the authenticated user in this trip
   * @param participantCount - Total number of participants in the trip
   * @param totalAmount - Total amount of expenses for the trip (default: 0)
   * @returns TripListItemDto with extended information
   */
  static toListItemDto(
    trip: Trip,
    userRole: ParticipantRole,
    participantCount: number,
    totalAmount: number = 0,
  ): TripListItemDto {
    return {
      ...this.toResponseDto(trip),
      userRole,
      participantCount,
      totalAmount,
    };
  }

  /**
   * Maps a Trip entity to TripDetailResponseDto with participants and pagination metadata.
   * Includes the current user's role and paginated participant data.
   *
   * @param trip - Trip entity with participants relation loaded
   * @param userRole - Role of the authenticated user in the trip
   * @param paginationMeta - Pagination metadata for participants
   * @param totalAmount - Total amount of expenses for the trip (default: 0)
   * @returns TripDetailResponseDto with detailed trip information
   */
  static toDetailDto(
    trip: Trip,
    userRole: ParticipantRole,
    paginationMeta: ParticipantsPaginationMeta,
    totalAmount: number = 0,
  ): TripDetailResponseDto {
    // Map participants to DTOs, filtering out soft-deleted ones
    const participants = (trip.participants || [])
      .filter((p) => !p.deletedAt)
      .map((p) => this.toParticipantDto(p));

    return {
      ...this.toResponseDto(trip),
      userRole,
      participants,
      participantsMeta: paginationMeta,
      totalAmount,
    };
  }

  /**
   * Maps a TripParticipant entity to TripParticipantDto.
   * Includes basic user information.
   *
   * @param participant - TripParticipant entity with user relation loaded
   * @returns TripParticipantDto with participant and user data
   */
  static toParticipantDto(participant: TripParticipant): TripParticipantDto {
    // Participant may come without the user relation loaded; guard before mapping
    const user = participant.user
      ? this.toUserSummaryDto(participant.user)
      : null;

    return {
      id: participant.id,
      userId: participant.userId,
      role: participant.role,
      user,
    };
  }

  /**
   * Maps a User entity to UserSummaryDto.
   * Includes only public user information.
   *
   * @param user - User entity
   * @returns UserSummaryDto with basic user data
   */
  static toUserSummaryDto(
    user: Pick<User, 'id' | 'nombre' | 'email'> | null | undefined,
  ): UserSummaryDto | null {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    };
  }
}
