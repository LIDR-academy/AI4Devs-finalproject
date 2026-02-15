# HU4-BE-001: Endpoint de Reserva de Cita Médica

## Información General
- **ID**: HU4-BE-001
- **Historia de Usuario**: HU4 - Reserva de Cita Médica
- **Tipo**: Backend
- **Prioridad**: Crítica
- **Estimación**: 20 horas (3 story points)
- **Dependencias**: HU4-DB-001 (Tablas APPOINTMENTS, SLOTS, APPOINTMENT_HISTORY)

## Descripción
Implementar endpoint POST `/api/v1/appointments` que crea una cita médica usando transacciones ACID, previene doble booking con soft locks, valida restricciones de negocio, y encola notificaciones asíncronas.

## Criterios de Aceptación

### CA1: Autenticación y Autorización
- [ ] Endpoint requiere autenticación JWT
- [ ] Verificar que token contenga role="patient"
- [ ] Retornar error 401 si no autenticado

### CA2: Bloqueo Temporal de Slot (Soft Lock)
- [ ] Al iniciar reserva, bloquear slot (`locked_by=patientId`, `locked_until=NOW() + 5 minutos`)
- [ ] Si paciente no completa en 5 minutos, lock expira automáticamente

### CA3: Validación de Restricciones
- [ ] Verificar que paciente no tenga otra cita activa
- [ ] Verificar que slot siga disponible
- [ ] Verificar que slot pertenezca al médico seleccionado

### CA4: Creación de Cita (Transacción ACID)
- [ ] Ejecutar en transacción:
  1. Verificar y bloquear slot (UPDATE con WHERE conditions)
  2. Verificar que paciente no tiene cita activa
  3. Crear registro en APPOINTMENTS con status='confirmed'
  4. Marcar slot como no disponible (`is_available=false`)
  5. Crear registro en APPOINTMENT_HISTORY
- [ ] Rollback completo si cualquier paso falla

### CA5: Prevención de Doble Booking
- [ ] Usar SELECT FOR UPDATE o UPDATE con condiciones
- [ ] Si dos pacientes intentan reservar mismo slot, solo uno tiene éxito
- [ ] Retornar error 409 si slot ya fue reservado

### CA6: Notificaciones
- [ ] Encolar email de confirmación (SendGrid) en Bull
- [ ] Notificaciones asíncronas (no bloquean respuesta)

> **Nota MVP**: Las notificaciones Web Push quedan fuera del alcance del MVP. Ver [documentation/MVP_SCOPE.md](../../MVP_SCOPE.md) y [Limitaciones del MVP](../../ARQUITECTURA_MVP.md#limitaciones-conocidas).

## Pasos Técnicos Detallados

### 1. Crear Servicio de Citas
**Ubicación**: `backend/src/services/appointment.service.ts`

```typescript
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Slot } from '../entities/slot.entity';
import { AppointmentHistory } from '../entities/appointment-history.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Slot)
    private slotRepository: Repository<Slot>,
    @InjectRepository(AppointmentHistory)
    private historyRepository: Repository<AppointmentHistory>,
    private dataSource: DataSource,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async createAppointment(
    patientId: string,
    doctorId: string,
    slotId: string,
    appointmentDate: Date,
    notes?: string,
  ): Promise<Appointment> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Bloquear y verificar slot
      const slot = await manager
        .createQueryBuilder(Slot, 'slot')
        .where('slot.id = :slotId', { slotId })
        .andWhere('slot.doctor_id = :doctorId', { doctorId })
        .andWhere('slot.is_available = :available', { available: true })
        .andWhere(
          '(slot.locked_until IS NULL OR slot.locked_until < NOW())',
        )
        .setLock('pessimistic_write')
        .getOne();

      if (!slot) {
        throw new ConflictException('El slot seleccionado no está disponible');
      }

      // Bloquear slot por 5 minutos
      slot.lockedBy = patientId;
      slot.lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      await manager.save(slot);

      // 2. Verificar que paciente no tiene cita activa
      const activeAppointment = await manager
        .createQueryBuilder(Appointment, 'appointment')
        .where('appointment.patient_id = :patientId', { patientId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: ['confirmed', 'pending'],
        })
        .andWhere('appointment.appointment_date > NOW()')
        .getOne();

      if (activeAppointment) {
        throw new BadRequestException(
          'Ya tienes una cita activa. Cancela o reprograma la cita existente antes de crear una nueva',
        );
      }

      // 3. Crear cita
      const appointment = manager.create(Appointment, {
        patientId,
        doctorId,
        slotId,
        appointmentDate,
        status: 'confirmed',
        notes,
        reminderSent: false,
      });

      const savedAppointment = await manager.save(appointment);

      // 4. Marcar slot como no disponible
      slot.isAvailable = false;
      slot.lockedBy = null;
      slot.lockedUntil = null;
      await manager.save(slot);

      // 5. Crear registro en historial
      await manager.save(AppointmentHistory, {
        appointmentId: savedAppointment.id,
        oldStatus: null,
        newStatus: 'confirmed',
        changeReason: 'Cita creada',
        changedBy: patientId,
      });

      // Encolar notificaciones (fuera de transacción)
      await this.notificationQueue.add('send-appointment-confirmation', {
        appointmentId: savedAppointment.id,
      });

      return savedAppointment;
    });
  }
}
```

## Archivos Creados/Modificados (Implementación)

1. `backend/src/services/appointment.service.ts` - Servicio de citas (transacción ACID)
2. `backend/src/controllers/appointments.controller.ts` - Controlador
3. `backend/src/routes/appointments.routes.ts` - Rutas con auth
4. `backend/src/models/appointment.entity.ts` - Entidad Appointment
5. `backend/src/models/slot.entity.ts` - Entidad Slot
6. `backend/src/models/appointment-history.entity.ts` - Entidad AppointmentHistory
7. `backend/src/dto/appointments/create-appointment.dto.ts` - DTO validación
8. `backend/src/config/queue.ts` - Cola Bull para notificaciones

## Testing

Ver ticket HU4-TEST-001.
