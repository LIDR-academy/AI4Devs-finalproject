/**
 * Script de seed para la base de datos Buscadoc.
 *
 * Objetivo:
 * - Insertar datos de prueba en todas las entidades principales del modelo de datos usando Prisma ORM y PostgreSQL.
 * - Los datos generados respetan las relaciones y claves foráneas del sistema.
 * - Si ocurre algún error durante la inserción, se realiza rollback y no se guarda ningún dato.
 *
 * Instrucciones de ejecución:
 * 1. Asegúrate de tener la base de datos configurada y migrada.
 * 2. Ejecuta el script desde la terminal en la carpeta backend/prisma:
 *    node seed.js
 *
 * Requiere las dependencias definidas en package.json y la configuración de Prisma.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      // --- Estados ---
      const state1 = await tx.state.create({ data: { name: 'Ciudad de México' } });
      const state2 = await tx.state.create({ data: { name: 'Jalisco' } });

      // --- Ciudades ---
      const city1 = await tx.city.create({ data: { name: 'Coyoacán', state_id: state1.id } });
      const city2 = await tx.city.create({ data: { name: 'Guadalajara', state_id: state2.id } });
      const city3 = await tx.city.create({ data: { name: 'Zapopan', state_id: state2.id } });

      // --- Especialidades ---
      const specialty1 = await tx.specialty.create({
        data: { name: 'Cardiología', description: 'Especialista en enfermedades del corazón' }
      });
      const specialty2 = await tx.specialty.create({
        data: { name: 'Pediatría', description: 'Especialista en salud infantil' }
      });
      const specialty3 = await tx.specialty.create({
        data: { name: 'Dermatología', description: 'Especialista en piel' }
      });

      // --- Direcciones ---
      const location1 = await tx.location.create({
        data: {
          address: 'Av. Universidad 3000',
          exterior_number: '100',
          interior_number: 'A',
          neighborhood: 'Copilco',
          postal_code: '04510',
          city_id: city1.id,
          state_id: state1.id,
          google_maps_url: 'https://maps.google.com/?q=Av+Universidad+3000'
        }
      });

      const location2 = await tx.location.create({
        data: {
          address: 'Calle Juárez 123',
          exterior_number: '123',
          interior_number: null,
          neighborhood: 'Centro',
          postal_code: '44100',
          city_id: city2.id,
          state_id: state2.id,
          google_maps_url: 'https://maps.google.com/?q=Calle+Juarez+123'
        }
      });

      const location3 = await tx.location.create({
        data: {
          address: 'Av. Patria 456',
          exterior_number: '456',
          interior_number: 'B2',
          neighborhood: 'Jardines Universidad',
          postal_code: '45110',
          city_id: city3.id,
          state_id: state2.id,
          google_maps_url: 'https://maps.google.com/?q=Av+Patria+456'
        }
      });

      // --- Usuarios ---
      // Pacientes
      const userPatient1 = await tx.user.create({
        data: {
          first_name: 'Ana',
          last_name: 'Ramírez',
          email: 'ana.ramirez@example.com',
          password_hash: 'hash1',
          role: 'patient'
        }
      });
      const userPatient2 = await tx.user.create({
        data: {
          first_name: 'Luis',
          last_name: 'Gómez',
          email: 'luis.gomez@example.com',
          password_hash: 'hash2',
          role: 'patient'
        }
      });
      const userPatient3 = await tx.user.create({
        data: {
          first_name: 'María',
          last_name: 'Fernández',
          email: 'maria.fernandez@example.com',
          password_hash: 'hash3',
          role: 'patient'
        }
      });

      // Médicos
      const userDoctor1 = await tx.user.create({
        data: {
          first_name: 'Dr. Juan',
          last_name: 'Pérez',
          email: 'juan.perez@example.com',
          password_hash: 'hash4',
          role: 'doctor'
        }
      });
      const userDoctor2 = await tx.user.create({
        data: {
          first_name: 'Dra. Sofía',
          last_name: 'Martínez',
          email: 'sofia.martinez@example.com',
          password_hash: 'hash5',
          role: 'doctor'
        }
      });
      const userDoctor3 = await tx.user.create({
        data: {
          first_name: 'Dr. Carlos',
          last_name: 'López',
          email: 'carlos.lopez@example.com',
          password_hash: 'hash6',
          role: 'doctor'
        }
      });

      // --- Pacientes ---
      const patient1 = await tx.patient.create({
        data: {
          id: userPatient1.id,
          phone: '5551234567',
          birth_date: new Date('1990-05-15'),
          gender: 'F',
          location_id: location1.id
        }
      });
      const patient2 = await tx.patient.create({
        data: {
          id: userPatient2.id,
          phone: '3339876543',
          birth_date: new Date('1985-09-22'),
          gender: 'M',
          location_id: location2.id
        }
      });
      const patient3 = await tx.patient.create({
        data: {
          id: userPatient3.id,
          phone: '3314567890',
          birth_date: new Date('2000-01-10'),
          gender: 'F',
          location_id: location3.id
        }
      });

      // --- Médicos ---
      const doctor1 = await tx.doctor.create({
        data: {
          id: userDoctor1.id,
          license_number: 'MED12345',
          phone: '5559876543',
          location_id: location1.id,
          biography: 'Cardiólogo con 10 años de experiencia.',
          photo_url: 'https://firebasestorage.googleapis.com/v0/b/reznor-tools.firebasestorage.app/o/avatars%2Fdoctor-mexicano-dermat-logo-profesional.jpg?alt=media&token=8d31f8b0-d923-4ee0-ae97-9d2c0bf61238'
        }
      });
      const doctor2 = await tx.doctor.create({
        data: {
          id: userDoctor2.id,
          license_number: 'MED54321',
          phone: '3331234567',
          location_id: location2.id,
          biography: 'Pediatra apasionada por la salud infantil.',
          photo_url: 'https://firebasestorage.googleapis.com/v0/b/reznor-tools.firebasestorage.app/o/avatars%2Fdoctora-mexicana-endocrin-loga-profesional.jpg?alt=media&token=8004f885-ff03-4f39-8328-21f36d0cb97e'
        }
      });
      const doctor3 = await tx.doctor.create({
        data: {
          id: userDoctor3.id,
          license_number: 'MED67890',
          phone: '3319876543',
          location_id: location3.id,
          biography: 'Dermatólogo especialista en enfermedades de la piel.',
          photo_url: 'https://firebasestorage.googleapis.com/v0/b/reznor-tools.firebasestorage.app/o/avatars%2Fdoctora-mexicana-endocrin-loga-profesional.jpg?alt=media&token=8004f885-ff03-4f39-8328-21f36d0cb97e'
        }
      });

      // --- Asignar especialidades a médicos ---
      await tx.doctorSpecialty.create({
        data: {
          doctor_id: doctor1.id,
          specialty_id: specialty1.id
        }
      });
      await tx.doctorSpecialty.create({
        data: {
          doctor_id: doctor2.id,
          specialty_id: specialty2.id
        }
      });
      await tx.doctorSpecialty.create({
        data: {
          doctor_id: doctor3.id,
          specialty_id: specialty3.id
        }
      });
      await tx.doctorSpecialty.create({
        data: {
          doctor_id: doctor1.id,
          specialty_id: specialty3.id
        }
      });

      // --- Disponibilidad de médicos ---
      // Doctor 1: Lunes y Miércoles de 9:00 a 13:00
      await tx.availability.createMany({
        data: [
          {
            doctor_id: doctor1.id,
            day_of_week: 1, // Lunes
            start_time: new Date('2025-09-15T09:00:00'),
            end_time: new Date('2025-09-15T13:00:00'),
            is_available: true
          },
          {
            doctor_id: doctor1.id,
            day_of_week: 3, // Miércoles
            start_time: new Date('2025-09-17T09:00:00'),
            end_time: new Date('2025-09-17T13:00:00'),
            is_available: true
          }
        ]
      });

      // Doctor 2: Martes y Jueves de 15:00 a 18:00
      await tx.availability.createMany({
        data: [
          {
            doctor_id: doctor2.id,
            day_of_week: 2, // Martes
            start_time: new Date('2025-09-16T15:00:00'),
            end_time: new Date('2025-09-16T18:00:00'),
            is_available: true
          },
          {
            doctor_id: doctor2.id,
            day_of_week: 4, // Jueves
            start_time: new Date('2025-09-18T15:00:00'),
            end_time: new Date('2025-09-18T18:00:00'),
            is_available: true
          }
        ]
      });

      // Doctor 3: Viernes de 10:00 a 14:00 y Sábado de 9:00 a 12:00
      await tx.availability.createMany({
        data: [
          {
            doctor_id: doctor3.id,
            day_of_week: 5, // Viernes
            start_time: new Date('2025-09-19T10:00:00'),
            end_time: new Date('2025-09-19T14:00:00'),
            is_available: true
          },
          {
            doctor_id: doctor3.id,
            day_of_week: 6, // Sábado
            start_time: new Date('2025-09-20T09:00:00'),
            end_time: new Date('2025-09-20T12:00:00'),
            is_available: true
          }
        ]
      });

      // --- Citas ---
      const appointment1 = await tx.appointment.create({
        data: {
          patient_id: patient1.id,
          doctor_id: doctor1.id,
          appointment_date: new Date('2025-08-21T10:00:00'),
          status: 'confirmed',
          reason: 'Chequeo cardiológico anual'
        }
      });

      const appointment2 = await tx.appointment.create({
        data: {
          patient_id: patient2.id,
          doctor_id: doctor2.id,
          appointment_date: new Date('2025-08-22T15:30:00'),
          status: 'pending',
          reason: 'Consulta pediátrica por fiebre'
        }
      });

      const appointment3 = await tx.appointment.create({
        data: {
          patient_id: patient3.id,
          doctor_id: doctor3.id,
          appointment_date: new Date('2025-08-23T09:00:00'),
          status: 'completed',
          reason: 'Revisión de alergia cutánea'
        }
      });

      const appointment4 = await tx.appointment.create({
        data: {
          patient_id: patient1.id,
          doctor_id: doctor3.id,
          appointment_date: new Date('2025-08-24T11:00:00'),
          status: 'pending',
          reason: 'Consulta dermatológica preventiva'
        }
      });

      // --- Valoraciones ---
      await tx.rating.create({
        data: {
          patient_id: patient1.id,
          doctor_id: doctor1.id,
          appointment_id: appointment1.id,
          score: 5,
          comment: 'Excelente atención y explicación.',
          anonymous: false,
          rating_date: new Date('2025-08-21T12:00:00')
        }
      });

      await tx.rating.create({
        data: {
          patient_id: patient2.id,
          doctor_id: doctor2.id,
          appointment_id: appointment2.id,
          score: 4,
          comment: 'Buena consulta, resolvió mis dudas.',
          anonymous: true,
          rating_date: new Date('2025-08-22T17:00:00')
        }
      });

      await tx.rating.create({
        data: {
          patient_id: patient3.id,
          doctor_id: doctor3.id,
          appointment_id: appointment3.id,
          score: 5,
          comment: 'Muy profesional y amable.',
          anonymous: false,
          rating_date: new Date('2025-08-23T10:30:00')
        }
      });

      await tx.rating.create({
        data: {
          patient_id: patient1.id,
          doctor_id: doctor3.id,
          appointment_id: appointment4.id,
          score: 3,
          comment: 'Consulta rápida, pero efectiva.',
          anonymous: true,
          rating_date: new Date('2025-08-24T12:00:00')
        }
      });

      // --- Notificaciones ---
      await tx.notification.create({
        data: {
          user_id: userPatient1.id,
          message: 'Tu cita con el Dr. Juan Pérez está confirmada para el 21 de agosto.',
          status: 'sent',
          sent_at: new Date('2025-08-20T09:00:00')
        }
      });

      await tx.notification.create({
        data: {
          user_id: userPatient2.id,
          message: 'Recuerda tu cita pediátrica el 22 de agosto.',
          status: 'not_sent',
          sent_at: null
        }
      });

      await tx.notification.create({
        data: {
          user_id: userDoctor1.id,
          message: 'Nueva valoración recibida de Ana Ramírez.',
          status: 'sent',
          sent_at: new Date('2025-08-21T13:00:00')
        }
      });

      await tx.notification.create({
        data: {
          user_id: userDoctor3.id,
          message: 'Tienes una cita pendiente con Ana Ramírez el 24 de agosto.',
          status: 'not_sent',
          sent_at: null
        }
      });

      await tx.notification.create({
        data: {
          user_id: userPatient3.id,
          message: 'Gracias por tu valoración. ¡Tu opinión es importante!',
          status: 'sent',
          sent_at: new Date('2025-08-23T11:00:00')
        }
      });
    });

    console.log('✅ Seed ejecutado correctamente. Todos los datos fueron insertados.');
  } catch (error) {
    console.error('❌ Error durante el seed. Se realizó rollback y no se insertó ningún dato.');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
main();