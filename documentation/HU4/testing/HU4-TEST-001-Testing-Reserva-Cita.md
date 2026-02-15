# HU4-TEST-001: Testing - Reserva de Cita Médica

## Información General
- **ID**: HU4-TEST-001
- **Historia de Usuario**: HU4 - Reserva de Cita Médica
- **Tipo**: Testing
- **Prioridad**: Crítica
- **Estimación**: 12 horas (2 story points)
- **Dependencias**: HU4-FE-001, HU4-BE-001, HU4-DB-001

## Descripción
Implementar suite completa de tests para el flujo de reserva de citas médicas, incluyendo tests de prevención de doble booking, transacciones ACID, bloqueo temporal de slots, y validaciones de negocio.

## Criterios de Aceptación

### CA1: Tests Unitarios (Backend) ✅
- [x] Test de creación de cita exitosa
- [x] Test de validación de slot disponible (409)
- [x] Test de validación de paciente con cita activa (400)
- [x] Test de encolado de notificaciones

### CA2: Tests de Integración (Backend) ✅
- [x] Test de endpoint POST /api/v1/appointments (caso exitoso)
- [x] Test de endpoint con slot ya reservado (409)
- [x] Test de endpoint con paciente con cita activa (400)
- [x] Test de endpoint con doble booking simultáneo (409)
- [x] Test de endpoint sin token (401)
- [x] Test de endpoint con datos inválidos (400)

### CA3: Tests de Base de Datos ✅
- [x] Test de migraciones de tablas SLOTS, APPOINTMENTS, APPOINTMENT_HISTORY
- [x] Test de foreign keys y constraints
- [x] Test de índices (UQ_APPOINTMENTS_SLOT_ID)

### CA4: Tests Frontend (Component) ✅
- [x] Test de SlotSelector: información médico, slots, confirmación
- [x] Test de flujo: seleccionar slot → confirmar → createAppointment → redirect

## Pasos Técnicos Detallados

### 1. Test de Prevención de Doble Booking
**Ubicación**: `backend/tests/integration/appointments/double-booking.test.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('Prevención de Doble Booking', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let patientToken: string;
  let doctorId: string;
  let slotId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Crear paciente y obtener token
    // Crear médico y slot disponible
  });

  it('debe prevenir doble booking cuando dos pacientes intentan reservar el mismo slot', async () => {
    // Crear segundo paciente
    const patient2Token = await createTestPatientAndGetToken();

    // Intentar reservar el mismo slot simultáneamente
    const [response1, response2] = await Promise.all([
      request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          slotId,
          appointmentDate: '2026-02-01T10:00:00-06:00',
        }),
      request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({
          doctorId,
          slotId,
          appointmentDate: '2026-02-01T10:00:00-06:00',
        }),
    ]);

    // Solo uno debe tener éxito
    const successCount = [response1, response2].filter((r) => r.status === 201).length;
    const conflictCount = [response1, response2].filter((r) => r.status === 409).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);
  });
});
```

### 2. Test de Transacción ACID
**Ubicación**: `backend/tests/integration/appointments/transaction.test.ts`

```typescript
describe('Transacciones ACID', () => {
  it('debe hacer rollback completo si falla cualquier paso', async () => {
    // Simular error en creación de historial
    jest.spyOn(historyRepository, 'save').mockRejectedValueOnce(new Error('DB Error'));

    await expect(
      appointmentService.createAppointment(patientId, doctorId, slotId, appointmentDate),
    ).rejects.toThrow();

    // Verificar que no se creó la cita
    const appointment = await appointmentRepository.findOne({ where: { slotId } });
    expect(appointment).toBeNull();

    // Verificar que el slot sigue disponible
    const slot = await slotRepository.findOne({ where: { id: slotId } });
    expect(slot.isAvailable).toBe(true);
  });
});
```

### 3. Test de Bloqueo Temporal
**Ubicación**: `backend/tests/integration/appointments/slot-lock.test.ts`

```typescript
describe('Bloqueo Temporal de Slot', () => {
  it('debe bloquear slot por 5 minutos al iniciar reserva', async () => {
    const slot = await slotRepository.findOne({ where: { id: slotId } });
    
    // Iniciar reserva (sin completar)
    await appointmentService.lockSlot(slotId, patientId);

    const lockedSlot = await slotRepository.findOne({ where: { id: slotId } });
    expect(lockedSlot.lockedBy).toBe(patientId);
    expect(lockedSlot.lockedUntil).toBeDefined();

    // Verificar que otro paciente no puede reservar
    const response = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patient2Token}`)
      .send({ doctorId, slotId, appointmentDate });

    expect(response.status).toBe(409);
  });

  it('debe liberar slot después de 5 minutos', async () => {
    // Bloquear slot con tiempo pasado
    await slotRepository.update(slotId, {
      lockedUntil: new Date(Date.now() - 1000), // Hace 1 segundo
    });

    // Intentar reservar (debe funcionar)
    const response = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, slotId, appointmentDate });

    expect(response.status).toBe(201);
  });
});
```

## Archivos Creados/Modificados (Implementación)

1. `backend/tests/unit/services/appointment.service.test.ts` - Tests unitarios del servicio
2. `backend/tests/integration/api/appointments/create.test.ts` - Tests integración (expandido)
3. `backend/tests/migrations/migration.test.ts` - Tests de tablas SLOTS, APPOINTMENTS, APPOINTMENT_HISTORY
4. `backend/tests/helpers/factories.ts` - createTestAppointment
5. `frontend/tests/components/appointments/SlotSelector.test.tsx` - Tests del componente

**Nota**: Tests E2E con Cypress/Playwright quedan como extensión futura. La cobertura actual usa Jest (unit + integration + component).

## Cobertura Objetivo

- **Servicio de Citas**: 95% de cobertura
- **Prevención de Doble Booking**: 100% de cobertura
- **Transacciones ACID**: 100% de cobertura
- **Bloqueo de Slots**: 100% de cobertura

## Testing

Ver ticket HU4-TEST-001.
