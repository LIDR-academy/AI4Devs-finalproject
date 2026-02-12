# Sistema de Agendamiento de Citas - VetConnect

## Descripción General

El sistema de agendamiento de citas de VetConnect proporciona una solución completa para gestionar citas veterinarias con validación de disponibilidad, prevención de solapamientos, y recordatorios automáticos.

## Características Principales

### 1. Gestión de Clínicas

- **Horarios de Operación**: Cada clínica tiene horarios configurables por día de la semana
- **Formato JSON**: Los horarios se almacenan en formato JSON para flexibilidad
- **Validación**: Sistema valida que las citas estén dentro del horario de operación

```ruby
# Ejemplo de horarios de clínica
{
  'monday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
  'tuesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
  'sunday' => { 'open' => false }
}
```

### 2. Estados de Citas

El sistema maneja 5 estados diferentes:

- **scheduled** (0): Cita programada pero no confirmada
- **confirmed** (1): Cita confirmada por el dueño o clínica
- **completed** (2): Cita realizada y completada
- **cancelled** (3): Cita cancelada (con razón opcional)
- **no_show** (4): Paciente no se presentó a la cita

### 3. Validaciones de Negocio

#### Prevención de Solapamientos

El sistema previene que un veterinario tenga citas superpuestas:

```ruby
# Algoritmo de detección de solapamiento
# Dos citas se solapan si: (start1 < end2) AND (end1 > start2)
overlapping = Appointment
  .where(veterinarian_id: veterinarian_id)
  .where.not(id: id)
  .where.not(status: [:cancelled, :no_show])
  .where('appointment_date < ? AND (appointment_date + duration_minutes) > ?',
         end_time, appointment_date)
```

#### Validación de Horarios de Clínica

```ruby
# Verifica que la cita esté dentro del horario de operación
day_of_week = appointment_date.strftime('%A').downcase
hours = clinic.operating_hours[day_of_week]

# Valida que:
# 1. La clínica esté abierta ese día
# 2. La hora de inicio esté dentro del horario
# 3. La hora de fin esté dentro del horario
```

#### Validación de Roles

- Solo usuarios con rol `veterinarian` o `admin` pueden ser asignados como veterinarios
- Validación automática al crear o actualizar citas

### 4. Sistema de Recordatorios

#### Recordatorios Automáticos

- Se envían 24 horas antes de la cita
- Solo para citas en estado `scheduled` o `confirmed`
- Prevención de recordatorios duplicados mediante `reminder_sent_at`

```ruby
# Callback after_create en Appointment
def schedule_reminder
  if appointment_date > 24.hours.from_now
    AppointmentReminderJob.set(wait_until: appointment_date - 24.hours)
                          .perform_later(id)
  end
end
```

#### Notificaciones de Cambios

- Notifica automáticamente cuando se reprograma una cita
- Enviado mediante `AppointmentChangeNotificationJob`

### 5. Calculador de Disponibilidad

Servicio que calcula slots disponibles para un veterinario en una fecha específica:

```ruby
# Uso del AvailabilityCalculator
slots = Appointment.available_slots(veterinarian_id, date, clinic_id)

# Retorna:
[
  { start_time: Time, end_time: Time, available: true },
  { start_time: Time, end_time: Time, available: true },
  ...
]
```

**Algoritmo:**

1. Obtiene horarios de operación de la clínica para el día
2. Genera slots de 30 minutos desde apertura hasta cierre
3. Excluye slots que se solapan con citas existentes
4. Retorna array de slots disponibles

## API Endpoints

### GET /appointments/available_slots

Obtiene slots disponibles para un veterinario en una fecha específica.

**Parámetros:**

- `veterinarian_id` (required): ID del veterinario
- `date` (required): Fecha en formato YYYY-MM-DD
- `clinic_id` (required): ID de la clínica

**Respuesta:**

```json
{
  "slots": [
    {
      "start_time": "2026-03-10T09:00:00Z",
      "end_time": "2026-03-10T09:30:00Z",
      "available": true
    },
    {
      "start_time": "2026-03-10T09:30:00Z",
      "end_time": "2026-03-10T10:00:00Z",
      "available": true
    }
  ]
}
```

**Errores:**

- `400 Bad Request`: Formato de fecha inválido
- `404 Not Found`: Clínica no encontrada
- `500 Internal Server Error`: Error del servidor

## Acciones del Controlador

### Acciones Estándar

- `index`: Lista de citas (filtrable por status)
- `show`: Detalles de una cita
- `new`: Formulario nueva cita
- `create`: Crear cita (envía email de confirmación)
- `edit`: Formulario editar cita
- `update`: Actualizar cita
- `destroy`: Cancelar cita (envía email de cancelación)

### Acciones Especiales

#### POST /appointments/:id/complete

Marca una cita como completada y redirige a crear registro médico.

**Autorización:** Solo veterinarios y admins

```ruby
def complete
  if @appointment.complete!
    redirect_to new_appointment_medical_record_path(@appointment)
  end
end
```

#### POST /appointments/:id/cancel

Cancela una cita con razón opcional.

**Autorización:** Dueño de la mascota o admin

```ruby
def cancel
  if @appointment.cancel!(params[:cancellation_reason])
    AppointmentMailer.cancellation(@appointment).deliver_later
    redirect_to @appointment
  end
end
```

#### POST /appointments/:id/confirm

Confirma una cita programada.

**Autorización:** Cualquier usuario autenticado

#### POST /appointments/:id/mark_no_show

Marca que el paciente no se presentó.

**Autorización:** Solo veterinarios y admins

## Emails

El sistema envía 4 tipos de emails:

### 1. Confirmación de Cita

- **Cuándo:** Al crear una nueva cita
- **Template:** `appointment_mailer/confirmation`
- **Contenido:** Detalles completos de la cita

### 2. Recordatorio de Cita

- **Cuándo:** 24 horas antes de la cita
- **Template:** `appointment_mailer/reminder`
- **Contenido:** Recordatorio con detalles y ubicación

### 3. Cita Cancelada

- **Cuándo:** Al cancelar una cita
- **Template:** `appointment_mailer/cancellation`
- **Contenido:** Confirmación de cancelación y razón

### 4. Cita Reprogramada

- **Cuándo:** Al cambiar la fecha/hora de una cita
- **Template:** `appointment_mailer/rescheduled`
- **Contenido:** Nueva fecha y hora de la cita

## Scopes Útiles

```ruby
# Citas próximas
Appointment.upcoming

# Citas pasadas
Appointment.past

# Citas de hoy
Appointment.today

# Citas de esta semana
Appointment.this_week

# Citas que necesitan recordatorio
Appointment.pending_reminder

# Citas de un veterinario
Appointment.for_veterinarian(vet_id)

# Citas de una clínica
Appointment.for_clinic(clinic_id)

# Citas activas (scheduled o confirmed)
Appointment.active

# Citas de una fecha específica
Appointment.for_date(date)
```

## Jobs en Background

### AppointmentReminderJob

```ruby
# Envía recordatorio por email
AppointmentReminderJob.perform_later(appointment_id)

# Programado automáticamente para 24h antes
AppointmentReminderJob.set(wait_until: appointment_date - 24.hours)
                      .perform_later(appointment_id)
```

### AppointmentChangeNotificationJob

```ruby
# Notifica cambios en la cita
AppointmentChangeNotificationJob.perform_later(appointment_id)

# Se ejecuta automáticamente al actualizar appointment_date
```

## Autorización (Pundit)

### AppointmentPolicy

**Ver cita:**
- Dueño de la mascota
- Veterinarios (todas)
- Admins (todas)

**Crear cita:**
- Owners (para sus mascotas)
- Veterinarios
- Admins

**Actualizar cita:**
- Dueño de la mascota (si no está completada o cancelada)
- Veterinarios
- Admins

**Cancelar cita:**
- Dueño de la mascota (si no está completada)
- Admins

**Completar cita:**
- Solo veterinarios y admins

**Marcar no show:**
- Solo veterinarios y admins

## Testing

### Tests de Modelo

```bash
# Ejecutar tests del modelo Appointment
bundle exec rspec spec/models/appointment_spec.rb

# Tests cubiertos:
# - Validaciones de fecha
# - Validación de solapamientos
# - Validación de horarios de clínica
# - Métodos de estado (cancel!, complete!, etc.)
# - Scopes
# - Cálculo de disponibilidad
```

### Tests de Servicio

```bash
# Ejecutar tests del AvailabilityCalculator
bundle exec rspec spec/services/availability_calculator_spec.rb

# Tests cubiertos:
# - Generación de slots
# - Exclusión de slots ocupados
# - Manejo de días cerrados
# - Citas de diferente duración
```

### Tests de Jobs

```bash
# Ejecutar tests de jobs
bundle exec rspec spec/jobs/appointment_reminder_job_spec.rb
bundle exec rspec spec/jobs/appointment_change_notification_job_spec.rb

# Tests cubiertos:
# - Envío de emails
# - Actualización de timestamps
# - Manejo de citas canceladas/completadas
# - Manejo de errores
```

### Tests de Mailer

```bash
# Ejecutar tests del mailer
bundle exec rspec spec/mailers/appointment_mailer_spec.rb

# Tests cubiertos:
# - Contenido de emails
# - Destinatarios correctos
# - Información de citas incluida
```

## Ejemplos de Uso

### Crear una Cita

```ruby
appointment = Appointment.create(
  pet: pet,
  veterinarian: vet,
  clinic: clinic,
  appointment_date: 2.days.from_now.change(hour: 10),
  duration_minutes: 30,
  reason: 'Chequeo general',
  appointment_type: 'consultation'
)
```

### Verificar Disponibilidad

```ruby
# Obtener slots disponibles
slots = Appointment.available_slots(vet.id, Date.tomorrow, clinic.id)

# Encontrar primer slot disponible
first_available = slots.find { |slot| slot[:available] }
```

### Cancelar una Cita

```ruby
appointment.cancel!('Cambio de planes del dueño')
```

### Reprogramar una Cita

```ruby
new_date = 3.days.from_now.change(hour: 14)
appointment.reschedule!(new_date)
```

### Enviar Recordatorio Manual

```ruby
appointment.send_reminder!
```

## Consideraciones de Performance

### Índices de Base de Datos

```ruby
# Índices creados:
add_index :appointments, [:veterinarian_id, :appointment_date]
add_index :appointments, [:clinic_id, :appointment_date]
add_index :appointments, :reminder_sent_at
add_index :appointments, :status
```

### Prevención de N+1

```ruby
# Siempre usar includes en consultas
Appointment.includes(:pet, :veterinarian, :clinic)
```

### Consultas Optimizadas

```ruby
# Validación de solapamiento usa query eficiente
# No carga objetos en memoria, solo verifica existencia
overlapping.exists?
```

## Mantenimiento

### Tarea Rake para Recordatorios

Crear tarea para ejecutar periódicamente:

```ruby
# lib/tasks/appointments.rake
namespace :appointments do
  desc "Send pending appointment reminders"
  task send_reminders: :environment do
    count = 0
    Appointment.pending_reminder.find_each do |appointment|
      appointment.send_reminder!
      count += 1
    end
    puts "Sent #{count} reminders"
  end
end
```

Ejecutar con cron:

```bash
# Cada hora
0 * * * * cd /path/to/app && bundle exec rake appointments:send_reminders
```

### Seeds

```bash
# Resetear base de datos y cargar datos de ejemplo
rails db:reset

# Solo cargar seeds
rails db:seed
```

## Troubleshooting

### Error: Veterinario no disponible

**Causa:** Solapamiento de citas

**Solución:**
1. Verificar citas existentes del veterinario
2. Usar API de slots disponibles
3. Ajustar hora o duración de la cita

### Error: Fuera de horario de atención

**Causa:** Cita fuera del horario de la clínica

**Solución:**
1. Verificar horarios de la clínica
2. Elegir día/hora dentro del horario
3. Considerar clínica con horario extendido

### Recordatorios no se envían

**Causa:** Job no configurado o cola no procesándose

**Solución:**
1. Verificar que Sidekiq/Delayed Job esté corriendo
2. Verificar logs de jobs
3. Ejecutar recordatorios manualmente con rake task

## Futuras Mejoras

- [ ] Integración con SMS (Twilio)
- [ ] Calendario visual con drag & drop
- [ ] Recurring appointments (citas recurrentes)
- [ ] Waitlist automática
- [ ] Integración con Google Calendar
- [ ] Notificaciones push móviles
- [ ] Sistema de encuestas post-consulta
- [ ] Analytics y reportes de citas

## Soporte

Para preguntas o problemas, contacta al equipo de desarrollo en: dev@vetconnect.com
