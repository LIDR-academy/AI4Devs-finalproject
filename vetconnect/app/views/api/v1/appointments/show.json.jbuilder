json.id @appointment.id

json.pet do
  json.id @appointment.pet.id
  json.name @appointment.pet.name
  json.species @appointment.pet.species
  json.breed @appointment.pet.breed
  json.age @appointment.pet.age
end

json.veterinarian do
  json.id @appointment.veterinarian.id
  json.name @appointment.veterinarian.full_name
  json.first_name @appointment.veterinarian.first_name
  json.last_name @appointment.veterinarian.last_name
  json.email @appointment.veterinarian.email
end

json.clinic do
  json.id @appointment.clinic.id
  json.name @appointment.clinic.name
  json.address @appointment.clinic.address
  json.phone @appointment.clinic.phone
  json.email @appointment.clinic.email
  json.active @appointment.clinic.active
end

json.appointment_date @appointment.appointment_date
json.duration_minutes @appointment.duration_minutes
json.status @appointment.status
json.appointment_type @appointment.appointment_type
json.reason @appointment.reason
json.notes @appointment.notes
json.cancellation_reason @appointment.cancellation_reason
json.reminder_sent_at @appointment.reminder_sent_at

json.can_be_cancelled @appointment.can_be_cancelled?
json.can_be_rescheduled @appointment.can_be_rescheduled?

json.created_at @appointment.created_at
json.updated_at @appointment.updated_at
