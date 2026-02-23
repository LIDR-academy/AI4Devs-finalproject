# frozen_string_literal: true

# Clear existing data in development
if Rails.env.development?
  puts "🧹 Limpiando datos existentes..."
  Document.destroy_all
  MedicalRecord.destroy_all
  Appointment.destroy_all
  Pet.destroy_all
  Clinic.destroy_all
  User.destroy_all
end

puts "🏥 Creando clínicas..."

# Create Clinics
clinic1 = Clinic.create!(
  name: 'VetConnect Central',
  address: '123 Main Street, Downtown, Ciudad',
  phone: '+1234567800',
  email: 'central@vetconnect.com',
  active: true,
  operating_hours: {
    'monday' => { 'open' => true, 'start' => '08:00', 'end' => '20:00' },
    'tuesday' => { 'open' => true, 'start' => '08:00', 'end' => '20:00' },
    'wednesday' => { 'open' => true, 'start' => '08:00', 'end' => '20:00' },
    'thursday' => { 'open' => true, 'start' => '08:00', 'end' => '20:00' },
    'friday' => { 'open' => true, 'start' => '08:00', 'end' => '20:00' },
    'saturday' => { 'open' => true, 'start' => '09:00', 'end' => '14:00' },
    'sunday' => { 'open' => false }
  }
)

clinic2 = Clinic.create!(
  name: 'VetConnect Norte - Clínica 24/7',
  address: '456 North Avenue, Zona Norte, Ciudad',
  phone: '+1234567801',
  email: 'norte@vetconnect.com',
  active: true,
  operating_hours: {
    'monday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'tuesday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'wednesday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'thursday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'friday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'saturday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
    'sunday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' }
  }
)

clinic3 = Clinic.create!(
  name: 'VetConnect Sur',
  address: '789 South Boulevard, Zona Sur, Ciudad',
  phone: '+1234567802',
  email: 'sur@vetconnect.com',
  active: true,
  operating_hours: {
    'monday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
    'tuesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
    'wednesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
    'thursday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
    'friday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
    'saturday' => { 'open' => false },
    'sunday' => { 'open' => false }
  }
)

puts "✅ Clínicas creadas: #{clinic1.name}, #{clinic2.name}, #{clinic3.name}"

puts "\n🌱 Creando usuarios de ejemplo..."

# Create Admin User (idempotent - uses find_or_create_by)
admin = User.find_or_create_by!(email: 'admin@vetconnect.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'Ana'
  u.last_name = 'Administradora'
  u.phone = '+1234567890'
  u.role = :admin
  u.confirmed_at = Time.current
end
# Ensure admin is confirmed even if it already existed
admin.update(confirmed_at: Time.current) unless admin.confirmed?
puts "✅ Admin listo: #{admin.email}"

# Create Veterinarians (idempotent)
vet1 = User.find_or_create_by!(email: 'carlos@vetconnect.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'Dr. Carlos'
  u.last_name = 'Rodríguez'
  u.phone = '+1234567891'
  u.role = :veterinarian
  u.confirmed_at = Time.current
end
vet1.update(confirmed_at: Time.current) unless vet1.confirmed?

vet2 = User.find_or_create_by!(email: 'sofia@vetconnect.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'Dra. Sofía'
  u.last_name = 'Martínez'
  u.phone = '+1234567892'
  u.role = :veterinarian
  u.confirmed_at = Time.current
end
vet2.update(confirmed_at: Time.current) unless vet2.confirmed?
puts "✅ Veterinarios listos: #{vet1.email}, #{vet2.email}"

# Create Pet Owners (idempotent)
owner1 = User.find_or_create_by!(email: 'maria@example.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'María'
  u.last_name = 'González'
  u.phone = '+1234567893'
  u.role = :owner
  u.confirmed_at = Time.current
end
owner1.update(confirmed_at: Time.current) unless owner1.confirmed?

owner2 = User.find_or_create_by!(email: 'juan@example.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'Juan'
  u.last_name = 'Pérez'
  u.phone = '+1234567894'
  u.role = :owner
  u.confirmed_at = Time.current
end
owner2.update(confirmed_at: Time.current) unless owner2.confirmed?

owner3 = User.find_or_create_by!(email: 'laura@example.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.first_name = 'Laura'
  u.last_name = 'Sánchez'
  u.phone = '+1234567895'
  u.role = :owner
  u.confirmed_at = Time.current
end
owner3.update(confirmed_at: Time.current) unless owner3.confirmed?
puts "✅ Owners listos: #{owner1.email}, #{owner2.email}, #{owner3.email}"

puts "\n🐕 Creando mascotas..."

# Pets for Owner 1 (María) - idempotent using microchip_number
max = Pet.find_or_create_by!(microchip_number: 'MX123456789012345') do |p|
  p.user = owner1
  p.name = 'Max'
  p.species = :dog
  p.breed = 'Golden Retriever'
  p.birth_date = 3.years.ago.to_date
  p.gender = :male
  p.weight = 30.5
  p.color = 'Golden'
  p.special_notes = 'Muy amigable con niños y otros perros. Disfruta nadar y jugar con pelotas.'
  p.active = true
end

luna = Pet.find_or_create_by!(microchip_number: 'LN987654321098765') do |p|
  p.user = owner1
  p.name = 'Luna'
  p.species = :cat
  p.breed = 'Persian'
  p.birth_date = 2.years.ago.to_date
  p.gender = :female
  p.weight = 4.2
  p.color = 'White'
  p.special_notes = 'Necesita cepillado diario. Dieta especial para control de bolas de pelo.'
  p.active = true
end
puts "✅ Mascotas de María: #{max.name}, #{luna.name}"

# Pets for Owner 2 (Juan) - idempotent using microchip_number
rocky = Pet.find_or_create_by!(microchip_number: 'RK456789012345678') do |p|
  p.user = owner2
  p.name = 'Rocky'
  p.species = :dog
  p.breed = 'German Shepherd'
  p.birth_date = 5.years.ago.to_date
  p.gender = :male
  p.weight = 35.0
  p.color = 'Black and Tan'
  p.special_notes = 'Excelente perro guardián. Entrenado profesionalmente.'
  p.active = true
end

bella = Pet.find_or_create_by!(user: owner2, name: 'Bella') do |p|
  p.species = :bird
  p.breed = 'Parrot'
  p.birth_date = 4.years.ago.to_date
  p.gender = :female
  p.weight = 0.4
  p.color = 'Green and Red'
  p.special_notes = 'Muy sociable, habla algunas palabras.'
  p.active = true
end
puts "✅ Mascotas de Juan: #{rocky.name}, #{bella.name}"

# Pets for Owner 3 (Laura) - idempotent
mimi = Pet.find_or_create_by!(user: owner3, name: 'Mimi') do |p|
  p.species = :cat
  p.breed = 'Siamese'
  p.birth_date = 1.year.ago.to_date
  p.gender = :female
  p.weight = 3.5
  p.color = 'Cream and Brown'
  p.special_notes = 'Algo tímida con desconocidos.'
  p.active = true
end

coco = Pet.find_or_create_by!(user: owner3, name: 'Coco') do |p|
  p.species = :rabbit
  p.breed = 'Holland Lop'
  p.birth_date = 6.months.ago.to_date
  p.gender = :male
  p.weight = 1.2
  p.color = 'Brown'
  p.special_notes = 'Le gustan las zanahorias y el heno de alfalfa.'
  p.active = true
end

# Inactive pet (adoptado) - idempotent using microchip_number
toby = Pet.find_or_create_by!(microchip_number: 'TB789012345678901') do |p|
  p.user = owner3
  p.name = 'Toby'
  p.species = :dog
  p.breed = 'Beagle'
  p.birth_date = 8.years.ago.to_date
  p.gender = :male
  p.weight = 12.5
  p.color = 'Tricolor'
  p.special_notes = 'Adoptado por otra familia en diciembre 2025.'
  p.active = false
end
puts "✅ Mascotas de Laura: #{mimi.name}, #{coco.name}, #{toby.name} (inactivo)"

puts "\n📅 Creando citas..."

# Skip creating appointments if they already exist (idempotent check)
if Appointment.count > 0
  puts "⚠️  Citas ya existen (#{Appointment.count} citas), saltando creación..."
else
  # Future appointments - use monday to avoid closed days
  next_monday = Date.today.next_occurring(:monday)

app1 = Appointment.create!(
  pet: max,
  veterinarian: vet1,
  clinic: clinic1,
  appointment_date: Time.zone.local(next_monday.year, next_monday.month, next_monday.day, 10, 0),
  duration_minutes: 30,
  status: :scheduled,
  appointment_type: 'consultation',
  reason: 'Chequeo general anual',
  notes: 'Primera visita del año'
)

next_tuesday = next_monday + 1.day
app2 = Appointment.create!(
  pet: luna,
  veterinarian: vet2,
  clinic: clinic1,
  appointment_date: Time.zone.local(next_tuesday.year, next_tuesday.month, next_tuesday.day, 14, 30),
  duration_minutes: 45,
  status: :confirmed,
  appointment_type: 'vaccination',
  reason: 'Vacuna antirrábica',
  notes: 'Traer cartilla de vacunación'
)

next_wednesday = next_monday + 2.days
app3 = Appointment.create!(
  pet: rocky,
  veterinarian: vet1,
  clinic: clinic2,
  appointment_date: Time.zone.local(next_wednesday.year, next_wednesday.month, next_wednesday.day, 11, 0),
  duration_minutes: 60,
  status: :scheduled,
  appointment_type: 'dental',
  reason: 'Limpieza dental',
  notes: 'Requiere anestesia general'
)

app4 = Appointment.create!(
  pet: mimi,
  veterinarian: vet2,
  clinic: clinic3,
  appointment_date: Time.zone.local(next_wednesday.year, next_wednesday.month, next_wednesday.day, 15, 0),
  duration_minutes: 30,
  status: :scheduled,
  appointment_type: 'checkup',
  reason: 'Control de gatito joven'
)

# Past completed appointment (skip validation for seeds)
past_date = 30.days.ago
app_past = Appointment.new(
  pet: max,
  veterinarian: vet1,
  clinic: clinic1,
  appointment_date: past_date,
  duration_minutes: 30,
  status: :completed,
  appointment_type: 'consultation',
  reason: 'Consulta de seguimiento'
)
app_past.save(validate: false)

# Past cancelled appointment
app_cancelled = Appointment.new(
  pet: bella,
  veterinarian: vet1,
  clinic: clinic1,
  appointment_date: 15.days.ago,
  duration_minutes: 30,
  status: :cancelled,
  appointment_type: 'consultation',
  reason: 'Chequeo general',
  cancellation_reason: 'Dueño tuvo compromiso laboral inesperado'
)
app_cancelled.save(validate: false)

puts "✅ Citas creadas: #{Appointment.count} citas (#{Appointment.upcoming.count} próximas, #{Appointment.past.count} pasadas)"
end

puts "\n📋 Creando registros médicos..."

# Skip creating medical records if they already exist (idempotent check)
if MedicalRecord.count > 0
  puts "⚠️  Registros médicos ya existen (#{MedicalRecord.count} registros), saltando creación..."
else
  # Medical Records
mr1 = MedicalRecord.create!(
  pet: max,
  veterinarian: vet1,
  appointment: app_past,
  visit_date: 30.days.ago.to_date,
  record_type: 'consultation',
  diagnosis: 'Estado de salud general excelente',
  treatment: 'Continuar con dieta actual y ejercicio regular',
  prescription: 'No se requiere medicación',
  notes: 'Peso adecuado para su edad y raza. Recomendar revisión en 6 meses.',
  weight: 30.5,
  temperature: 38.5
)

mr2 = MedicalRecord.create!(
  pet: luna,
  veterinarian: vet2,
  visit_date: 60.days.ago.to_date,
  record_type: 'vaccination',
  diagnosis: 'Vacunación preventiva',
  treatment: 'Administración de vacuna triple felina',
  prescription: 'Monitorear por 24 horas para reacciones adversas',
  notes: 'Sin reacciones adversas previas a vacunas.',
  weight: 4.0,
  temperature: 38.3
)

mr3 = MedicalRecord.create!(
  pet: rocky,
  veterinarian: vet1,
  visit_date: 90.days.ago.to_date,
  record_type: 'emergency',
  diagnosis: 'Gastroenteritis aguda',
  treatment: 'Hidratación IV, antieméticos',
  prescription: 'Metoclopramida 10mg cada 8 horas por 3 días',
  notes: 'Ingesta de alimento en mal estado. Recuperación completa esperada.',
  weight: 34.5,
  temperature: 39.2
)
puts "✅ Registros médicos creados: #{MedicalRecord.count} registros"
end

puts "\n📄 Creando documentos..."

# Skip creating documents if they already exist (idempotent check)
if Document.count > 0
  puts "⚠️  Documentos ya existen (#{Document.count} documentos), saltando creación..."
else

# Documents
doc1 = Document.create!(
  pet: max,
  uploaded_by: vet1,
  medical_record: mr1,
  title: 'Resultados de análisis de sangre',
  document_type: 'lab_result',
  description: 'Hemograma completo - Valores normales',
  file_name: 'analisis_max_2025.pdf',
  file_path: '/uploads/documents/analisis_max_2025.pdf',
  content_type: 'application/pdf',
  file_size: 524288
)

doc2 = Document.create!(
  pet: luna,
  uploaded_by: vet2,
  medical_record: mr2,
  title: 'Certificado de vacunación',
  document_type: 'vaccine_record',
  description: 'Certificado oficial de vacuna antirrábica',
  file_name: 'vacuna_luna_2025.pdf',
  file_path: '/uploads/documents/vacuna_luna_2025.pdf',
  content_type: 'application/pdf',
  file_size: 262144
)

doc3 = Document.create!(
  pet: rocky,
  uploaded_by: vet1,
  medical_record: mr3,
  title: 'Radiografía abdominal',
  document_type: 'x_ray',
  description: 'Radiografía de seguimiento post-tratamiento',
  file_name: 'radiografia_rocky_2025.jpg',
  file_path: '/uploads/documents/radiografia_rocky_2025.jpg',
  content_type: 'image/jpeg',
  file_size: 1048576
)

# Document uploaded by owner
doc4 = Document.create!(
  pet: max,
  uploaded_by: owner1,
  title: 'Certificado de pedigree',
  document_type: 'other',
  description: 'Certificado oficial de pedigree AKC',
  file_name: 'pedigree_max.pdf',
  file_path: '/uploads/documents/pedigree_max.pdf',
  content_type: 'application/pdf',
  file_size: 327680
)
puts "✅ Documentos creados: #{Document.count} documentos"
end

puts "\n" + "="*60
puts "✅ Seeds completados exitosamente!"
puts "="*60
puts "\n📊 Resumen de datos creados:"
puts "  • #{User.count} usuarios (1 admin, 2 vets, 3 owners)"
puts "  • #{Clinic.count} clínicas"
puts "  • #{Pet.count} mascotas (#{Pet.active.count} activas)"
puts "  • #{Appointment.count} citas:"
puts "    - #{Appointment.upcoming.count} próximas"
puts "    - #{Appointment.past.count} pasadas"
puts "    - #{Appointment.status_scheduled.count} programadas"
puts "    - #{Appointment.status_confirmed.count} confirmadas"
puts "    - #{Appointment.status_completed.count} completadas"
puts "    - #{Appointment.status_cancelled.count} canceladas"
puts "  • #{MedicalRecord.count} registros médicos"
puts "  • #{Document.count} documentos"
puts "\n🏥 Clínicas disponibles:"
puts "  • #{clinic1.name} - Horario extendido"
puts "  • #{clinic2.name} - Emergencias 24/7"
puts "  • #{clinic3.name} - Horario regular"
puts "\n🔑 Credenciales de acceso (todos con password: password123):"
puts "  Admin:        admin@vetconnect.com"
puts "  Veterinario:  carlos@vetconnect.com"
puts "  Veterinario:  sofia@vetconnect.com"
puts "  Owner:        maria@example.com"
puts "  Owner:        juan@example.com"
puts "  Owner:        laura@example.com"
puts "\n💡 Usa estas credenciales para testing manual de autorización"
puts "\n📅 Sistema de Citas Implementado:"
puts "  • Validación de disponibilidad de veterinarios"
puts "  • Prevención de solapamiento de citas"
puts "  • Validación de horarios de clínica"
puts "  • Recordatorios automáticos por email"
puts "  • API endpoint: GET /appointments/available_slots"
puts "="*60
