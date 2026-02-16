# HU5-DB-001: Migración - Actualizar Tabla APPOINTMENTS para Reprogramación/Cancelación

## Información General
- **ID**: HU5-DB-001  
- **Historia**: HU5 - Reprogramación/Cancelación  
- **Tipo**: Base de Datos  
- **Prioridad**: Alta  
- **Estimación**: 2h (0.5 sp)  
- **Dependencias**: HU4-DB-001

## Cambios requeridos
- Campo `cancellation_reason` (TEXT, nullable, max 500).
- Índice opcional en `status` para filtros.
- Asegurar longitud de `notes` <= 500 (si no existe constraint, documentar).
- Sincronizar con entidad Appointment.

## Pasos Técnicos
1) **Migración TypeORM** `migrations/1234567896-UpdateAppointmentsForReschedule.ts`
```ts
await queryRunner.addColumns('APPOINTMENTS', [
  new TableColumn({ name: 'cancellation_reason', type: 'text', isNullable: true }),
]);
await queryRunner.createIndex('APPOINTMENTS', new TableIndex({
  name: 'IDX_APPOINTMENTS_STATUS',
  columnNames: ['status'],
}));
```
`down`: drop índice y columna.

2) **Entidad** `entities/appointment.entity.ts`
```ts
@Column({ type: 'text', nullable: true, length: 500 })
cancellationReason?: string;
```

3) **Validación de longitud**
- Implementar validación en servicio/DTO (max 500) para reason y notes.

## Testing
- Migración up/down.
- Insert/Update con cancellation_reason.
- Query usa índice de status (explain).
