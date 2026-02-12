json.appointments @appointments do |appointment|
  json.id appointment.id
  json.pet do
    json.id appointment.pet.id
    json.name appointment.pet.name
    json.species appointment.pet.species
  end
  json.veterinarian do
    json.id appointment.veterinarian.id
    json.name appointment.veterinarian.full_name
    json.email appointment.veterinarian.email
  end
  json.clinic do
    json.id appointment.clinic.id
    json.name appointment.clinic.name
    json.address appointment.clinic.address
  end
  json.appointment_date appointment.appointment_date
  json.duration_minutes appointment.duration_minutes
  json.status appointment.status
  json.appointment_type appointment.appointment_type
  json.reason appointment.reason
  json.notes appointment.notes
  json.reminder_sent_at appointment.reminder_sent_at
  json.created_at appointment.created_at
  json.updated_at appointment.updated_at
end

json.meta do
  json.current_page @appointments.current_page
  json.total_pages @appointments.total_pages
  json.per_page @appointments.limit_value
  json.total_count @appointments.total_count
end
