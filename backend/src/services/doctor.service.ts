import { AppDataSource } from '../config/database';
import redisClient from '../config/redis';
import { UpdateDoctorProfileDto } from '../dto/doctors/update-profile.dto';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { Slot } from '../models/slot.entity';
import { User } from '../models/user.entity';
import { GeocodingService } from './geocoding.service';

export interface DoctorDetail {
  id: string;
  firstName: string;
  lastName: string;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
  }>;
  address: string;
  postalCode: string;
  ratingAverage?: number;
  totalReviews: number;
  verificationStatus: string;
}

export interface SlotResponse {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  lockedUntil: string | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  address: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  verificationStatus: string;
  ratingAverage?: number;
  totalReviews: number;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
  }>;
  updatedAt: string;
}

export interface UpdateDoctorProfileResult {
  doctor: DoctorProfile;
  warnings?: string[];
}

export class DoctorService {
  private geocodingService = new GeocodingService();

  private mapDoctorProfile(doctor: Doctor): DoctorProfile {
    return {
      id: doctor.id,
      userId: doctor.userId,
      email: doctor.user.email,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      phone: doctor.user.phone ?? undefined,
      bio: doctor.bio ?? undefined,
      address: doctor.address,
      postalCode: doctor.postalCode,
      latitude: doctor.latitude ?? undefined,
      longitude: doctor.longitude ?? undefined,
      verificationStatus: doctor.verificationStatus,
      ratingAverage: doctor.ratingAverage ?? undefined,
      totalReviews: doctor.totalReviews,
      specialties:
        doctor.specialties?.map((s) => ({
          id: s.id,
          nameEs: s.nameEs,
          nameEn: s.nameEn,
        })) ?? [],
      updatedAt: doctor.updatedAt.toISOString(),
    };
  }

  private async invalidateDoctorCaches(doctorId: string): Promise<void> {
    if (!redisClient.isOpen) {
      return;
    }

    const keysToDelete = [`doctor:${doctorId}`];

    for await (const key of redisClient.scanIterator({
      MATCH: 'doctors:*',
      COUNT: 100,
    })) {
      if (typeof key === 'string') {
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  }

  async getMyProfile(userId: string): Promise<DoctorProfile | null> {
    const doctor = await AppDataSource.getRepository(Doctor)
      .createQueryBuilder('doctor')
      .innerJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.specialties', 'specialties')
      .where('doctor.user_id = :userId', { userId })
      .getOne();

    if (!doctor) {
      return null;
    }

    return this.mapDoctorProfile(doctor);
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateDoctorProfileDto,
    ipAddress: string
  ): Promise<UpdateDoctorProfileResult | null> {
    let geocodingWarning: string | undefined;

    const updatedDoctor = await AppDataSource.transaction(async (entityManager) => {
      const doctorRepository = entityManager.getRepository(Doctor);
      const userRepository = entityManager.getRepository(User);
      const auditLogRepository = entityManager.getRepository(AuditLog);

      const doctor = await doctorRepository
        .createQueryBuilder('doctor')
        .innerJoinAndSelect('doctor.user', 'user')
        .leftJoinAndSelect('doctor.specialties', 'specialties')
        .where('doctor.user_id = :userId', { userId })
        .setLock('pessimistic_write')
        .getOne();

      if (!doctor) {
        return null;
      }

      const oldValues = {
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        phone: doctor.user.phone ?? null,
        bio: doctor.bio ?? null,
        address: doctor.address,
        postalCode: doctor.postalCode,
        latitude: doctor.latitude ?? null,
        longitude: doctor.longitude ?? null,
      };

      const incomingAddress = dto.address?.trim();
      const incomingPostalCode = dto.postalCode?.trim();
      const nextAddress = incomingAddress ?? doctor.address;
      const nextPostalCode = incomingPostalCode ?? doctor.postalCode;
      const shouldGeocode =
        incomingAddress !== undefined ||
        incomingPostalCode !== undefined;

      if (dto.firstName !== undefined) {
        doctor.user.firstName = dto.firstName.trim();
      }
      if (dto.lastName !== undefined) {
        doctor.user.lastName = dto.lastName.trim();
      }
      if (dto.phone !== undefined) {
        doctor.user.phone = dto.phone.trim();
      }
      if (dto.bio !== undefined) {
        doctor.bio = dto.bio.trim();
      }
      if (incomingAddress !== undefined) {
        doctor.address = incomingAddress;
      }
      if (incomingPostalCode !== undefined) {
        doctor.postalCode = incomingPostalCode;
      }

      if (shouldGeocode) {
        const geocoded = await this.geocodingService.geocodeAddress(
          nextAddress,
          nextPostalCode
        );
        if (geocoded) {
          doctor.latitude = geocoded.latitude;
          doctor.longitude = geocoded.longitude;
        } else {
          geocodingWarning =
            'No se pudo geocodificar la dirección. Se guardaron los cambios sin actualizar coordenadas.';
        }
      }

      await userRepository.save(doctor.user);
      await doctorRepository.save(doctor);

      const refreshedDoctor = await doctorRepository
        .createQueryBuilder('doctor')
        .innerJoinAndSelect('doctor.user', 'user')
        .leftJoinAndSelect('doctor.specialties', 'specialties')
        .where('doctor.id = :doctorId', { doctorId: doctor.id })
        .getOneOrFail();

      const newValues = {
        firstName: refreshedDoctor.user.firstName,
        lastName: refreshedDoctor.user.lastName,
        phone: refreshedDoctor.user.phone ?? null,
        bio: refreshedDoctor.bio ?? null,
        address: refreshedDoctor.address,
        postalCode: refreshedDoctor.postalCode,
        latitude: refreshedDoctor.latitude ?? null,
        longitude: refreshedDoctor.longitude ?? null,
      };

      await auditLogRepository.save(
        auditLogRepository.create({
          action: 'update_doctor_profile',
          entityType: 'doctor',
          entityId: refreshedDoctor.id,
          userId,
          ipAddress,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
        })
      );

      return refreshedDoctor;
    });

    if (!updatedDoctor) {
      return null;
    }

    await this.invalidateDoctorCaches(updatedDoctor.id);

    return {
      doctor: this.mapDoctorProfile(updatedDoctor),
      warnings: geocodingWarning ? [geocodingWarning] : undefined,
    };
  }

  async getById(doctorId: string): Promise<DoctorDetail | null> {
    const doctor = await AppDataSource.getRepository(Doctor)
      .createQueryBuilder('doctor')
      .innerJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.specialties', 'specialties')
      .where('doctor.id = :doctorId', { doctorId })
      .andWhere('doctor.verification_status = :status', { status: 'approved' })
      .getOne();

    if (!doctor) return null;

    return {
      id: doctor.id,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      specialties: doctor.specialties?.map((s) => ({
        id: s.id,
        nameEs: s.nameEs,
        nameEn: s.nameEn,
      })) ?? [],
      address: doctor.address,
      postalCode: doctor.postalCode,
      ratingAverage: doctor.ratingAverage ?? undefined,
      totalReviews: doctor.totalReviews,
      verificationStatus: doctor.verificationStatus,
    };
  }

  async getSlotsByDate(doctorId: string, date: string): Promise<SlotResponse[]> {
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    const slots = await AppDataSource.getRepository(Slot)
      .createQueryBuilder('slot')
      .where('slot.doctor_id = :doctorId', { doctorId })
      .andWhere('slot.start_time >= :startOfDay', { startOfDay })
      .andWhere('slot.start_time <= :endOfDay', { endOfDay })
      .orderBy('slot.start_time', 'ASC')
      .getMany();

    return slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isAvailable: slot.isAvailable,
      lockedUntil:
        slot.lockedUntil && slot.lockedUntil > new Date()
          ? slot.lockedUntil.toISOString()
          : null,
    }));
  }
}
