import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import { Doctor } from '../models/doctor.entity';
import { Specialty } from '../models/specialty.entity';
import * as bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

interface DoctorSeedData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  specialtyNames: string[];
  bio?: string;
}

const doctorsData: DoctorSeedData[] = [
  {
    email: 'dr.garcia@example.com',
    firstName: 'Juan',
    lastName: 'García',
    address: 'Av. Reforma 123, Col. Centro, CDMX',
    postalCode: '06000',
    latitude: 19.4326,
    longitude: -99.1332,
    specialtyNames: ['Cardiología', 'Medicina General'],
    bio: 'Cardiólogo con 15 años de experiencia',
  },
  {
    email: 'dr.martinez@example.com',
    firstName: 'María',
    lastName: 'Martínez',
    address: 'Av. Insurgentes Sur 1500, Col. Del Valle, CDMX',
    postalCode: '03100',
    latitude: 19.3850,
    longitude: -99.1615,
    specialtyNames: ['Dermatología'],
    bio: 'Dermatóloga especializada en tratamientos estéticos',
  },
  {
    email: 'dr.lopez@example.com',
    firstName: 'Carlos',
    lastName: 'López',
    address: 'Calz. de Tlalpan 4800, Col. Toriello Guerra, CDMX',
    postalCode: '14050',
    latitude: 19.3019,
    longitude: -99.1364,
    specialtyNames: ['Pediatría'],
    bio: 'Pediatra con enfoque en medicina preventiva',
  },
  {
    email: 'dr.rodriguez@example.com',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    address: 'Av. Universidad 1200, Col. Copilco, CDMX',
    postalCode: '04360',
    latitude: 19.3294,
    longitude: -99.1756,
    specialtyNames: ['Neurología'],
    bio: 'Neuróloga especializada en trastornos del sueño',
  },
  {
    email: 'dr.fernandez@example.com',
    firstName: 'Luis',
    lastName: 'Fernández',
    address: 'Av. Revolución 1500, Col. San Ángel, CDMX',
    postalCode: '01000',
    latitude: 19.3458,
    longitude: -99.1944,
    specialtyNames: ['Oftalmología'],
    bio: 'Oftalmólogo con experiencia en cirugía láser',
  },
];

export async function seedDoctors(): Promise<void> {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const doctorRepository = AppDataSource.getRepository(Doctor);
    const specialtyRepository = AppDataSource.getRepository(Specialty);

    for (const doctorData of doctorsData) {
      // Verificar si el usuario ya existe
      let user = await userRepository.findOne({
        where: { email: doctorData.email },
      });

      if (!user) {
        // Crear usuario
        user = userRepository.create({
          email: doctorData.email,
          password: await bcrypt.hash('password123', 12),
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          role: 'doctor',
          emailVerified: true,
        });
        user = await userRepository.save(user);
        logger.info(`✅ Usuario creado: ${doctorData.email}`);
      }

      // Verificar si el doctor ya existe
      let doctor = await doctorRepository.findOne({
        where: { userId: user.id },
        relations: ['specialties'],
      });

      if (!doctor) {
        // Crear doctor
        doctor = doctorRepository.create({
          userId: user.id,
          address: doctorData.address,
          postalCode: doctorData.postalCode,
          latitude: doctorData.latitude,
          longitude: doctorData.longitude,
          bio: doctorData.bio,
          verificationStatus: 'approved',
          ratingAverage: Math.random() * 2 + 3, // Rating entre 3 y 5
          totalReviews: Math.floor(Math.random() * 50) + 10, // Entre 10 y 60 reseñas
        });
        doctor = await doctorRepository.save(doctor);
        logger.info(`✅ Doctor creado: ${doctorData.firstName} ${doctorData.lastName}`);
      }

      // Asignar especialidades
      const specialties: Specialty[] = [];
      for (const specialtyName of doctorData.specialtyNames) {
        const specialty = await specialtyRepository.findOne({
          where: [{ nameEs: specialtyName }, { nameEn: specialtyName }],
        });
        if (specialty) {
          specialties.push(specialty);
        }
      }

      if (specialties.length > 0) {
        doctor.specialties = specialties;
        await doctorRepository.save(doctor);
        logger.info(
          `✅ Especialidades asignadas a ${doctorData.firstName} ${doctorData.lastName}: ${doctorData.specialtyNames.join(', ')}`
        );
      }
    }
  } catch (error) {
    logger.error('Error al crear médicos:', error);
    throw error;
  }
}
