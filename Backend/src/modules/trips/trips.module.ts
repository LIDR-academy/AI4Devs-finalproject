import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Trip } from './entities/trip.entity';
import { TripParticipant } from './entities/trip-participant.entity';
import { User } from '../users/entities/user.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { TripsController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';

/**
 * Módulo de Trips.
 *
 * Este módulo gestiona las operaciones relacionadas con viajes y participantes.
 *
 * Estructura (Patrón CSED):
 * - Controller: Maneja las peticiones HTTP de gestión de viajes
 * - Service: Contiene la lógica de negocio y acceso a datos mediante TypeORM
 * - Entity: Define los modelos de datos de Trip y TripParticipant
 * - DTO: Define los contratos de validación y respuesta de la API
 *
 * Endpoints:
 * - POST /trips - Crear un nuevo viaje (requiere autenticación)
 * - GET /trips/:id - Obtener detalles de un viaje con participantes paginados (requiere autenticación)
 *
 * Cache:
 * - TTL: 300 segundos (5 minutos) para trip details
 * - Max items: 100 trips en memoria
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripParticipant, User, Expense]),
    CacheModule.register({
      ttl: 300, // 5 minutos en segundos
      max: 100, // máximo 100 trips en caché
    }),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
