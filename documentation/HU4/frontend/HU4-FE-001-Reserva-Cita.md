# HU4-FE-001: Reserva de Cita Médica

## Información General
- **ID**: HU4-FE-001
- **Historia de Usuario**: HU4 - Reserva de Cita Médica
- **Tipo**: Frontend
- **Prioridad**: Crítica
- **Estimación**: 15 horas (2.5 story points)
- **Dependencias**: HU4-BE-001 (Endpoint de reserva), HU4-DB-001 (Tabla APPOINTMENTS, SLOTS)

## Descripción
Implementar interfaz completa para reservar citas médicas, incluyendo visualización de slots disponibles, selección de slot, bloqueo temporal, confirmación de reserva, y manejo de errores de doble booking.

## Criterios de Aceptación

### CA1: Visualización de Slots Disponibles
- [ ] Mostrar calendario con fechas disponibles (solo futuras)
- [ ] Mostrar slots disponibles por día (horarios de 30 minutos)
- [ ] Slots bloqueados o no disponibles deben mostrarse deshabilitados
- [ ] Mostrar slots en zona horaria de CDMX

### CA2: Selección de Slot
- [ ] Al hacer clic en slot disponible:
  - Mostrar información del slot (fecha, hora inicio, hora fin)
  - Mostrar información del médico (nombre, especialidad, dirección)
  - Habilitar botón "Confirmar Cita"
  - Permitir agregar nota opcional (máximo 500 caracteres)

### CA3: Bloqueo Temporal de Slot
- [ ] Al iniciar proceso de reserva, bloquear slot por 5 minutos
- [ ] Mostrar indicador "reservando..." en slot bloqueado
- [ ] Si no se completa en 5 minutos, liberar slot automáticamente

### CA4: Confirmación de Reserva
- [ ] Validar que paciente no tenga otra cita activa
- [ ] Enviar solicitud de reserva al backend
- [ ] Manejar errores de doble booking (409)
- [ ] Mostrar mensaje de éxito y redirigir a detalle de cita

### CA5: Manejo de Errores
- [ ] Error 400: Slot no disponible
- [ ] Error 400: Paciente tiene cita activa
- [ ] Error 409: Slot ya reservado por otro paciente
- [ ] Mostrar mensajes de error claros y específicos

## Pasos Técnicos Detallados

### 1. Crear Componente de Selección de Slot
**Ubicación**: `frontend/src/components/appointments/SlotSelector.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  lockedUntil?: string;
}

export default function SlotSelector({ doctorId }: { doctorId: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [note, setNote] = useState('');

  // Obtener slots disponibles
  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', doctorId, selectedDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/doctors/${doctorId}/slots?date=${format(selectedDate, 'yyyy-MM-dd')}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );
      return response.json();
    },
  });

  // Mutación para reservar cita
  const queryClient = useQueryClient();
  const reserveMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          doctorId,
          slotId,
          appointmentDate: selectedSlot?.startTime,
          notes: note,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al reservar cita');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push(`/appointments/${data.id}`);
    },
  });

  // Generar fechas disponibles (próximas 4 semanas)
  const availableDates = eachDayOfInterval({
    start: new Date(),
    end: addDays(new Date(), 28),
  });

  return (
    <div className="space-y-6">
      {/* Selector de fecha */}
      <div className="flex gap-2 overflow-x-auto">
        {availableDates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded ${
              format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {format(date, 'EEE d', { locale: es })}
          </button>
        ))}
      </div>

      {/* Slots del día seleccionado */}
      {isLoading ? (
        <div>Cargando slots...</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {slots?.map((slot: Slot) => {
            const isLocked = slot.lockedUntil && new Date(slot.lockedUntil) > new Date();
            const isSelected = selectedSlot?.id === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => !isLocked && slot.isAvailable && setSelectedSlot(slot)}
                disabled={!slot.isAvailable || isLocked}
                className={`p-4 rounded border ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : slot.isAvailable && !isLocked
                    ? 'border-gray-300 hover:border-blue-300'
                    : 'border-gray-200 bg-gray-100 opacity-50'
                }`}
              >
                {format(new Date(slot.startTime), 'HH:mm')}
                {isLocked && <span className="text-xs text-orange-500">Reservando...</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Formulario de confirmación */}
      {selectedSlot && (
        <div className="border p-4 rounded">
          <h3>Confirmar Cita</h3>
          <p>
            Fecha: {format(new Date(selectedSlot.startTime), 'PPP', { locale: es })}
          </p>
          <p>
            Hora: {format(new Date(selectedSlot.startTime), 'HH:mm')} -{' '}
            {format(new Date(selectedSlot.endTime), 'HH:mm')}
          </p>
          <textarea
            placeholder="Nota opcional (máximo 500 caracteres)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="w-full mt-4 p-2 border rounded"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => reserveMutation.mutate(selectedSlot.id)}
              disabled={reserveMutation.isPending}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {reserveMutation.isPending ? 'Reservando...' : 'Confirmar Cita'}
            </button>
            <button
              onClick={() => {
                setSelectedSlot(null);
                setNote('');
              }}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
          {reserveMutation.isError && (
            <div className="mt-2 text-red-500">
              {reserveMutation.error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Archivos Creados/Modificados (Implementación)

1. `frontend/app/components/appointments/SlotSelector.tsx` - Selector de slots + panel de confirmación
2. `frontend/app/[locale]/doctors/[doctorId]/availability/page.tsx` - Página de reserva
3. `frontend/lib/api/doctors.ts` - getDoctorById, getDoctorSlots
4. `frontend/lib/api/appointments.ts` - createAppointment
5. `frontend/messages/es.json`, `messages/en.json` - Traducciones appointments
6. `frontend/app/components/search/DoctorSearch.tsx` - Navegación con locale

**Backend (prerrequisito)**:
- `GET /api/v1/doctors/:doctorId` - Detalle de médico
- `GET /api/v1/doctors/:doctorId/slots?date=yyyy-MM-dd` - Slots disponibles

## Testing

Ver ticket HU4-TEST-001.
