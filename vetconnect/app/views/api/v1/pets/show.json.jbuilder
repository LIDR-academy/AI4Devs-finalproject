json.id @pet.id
json.name @pet.name
json.species @pet.species
json.breed @pet.breed
json.birth_date @pet.birth_date
json.age @pet.age
json.age_in_months @pet.age_in_months
json.gender @pet.gender
json.color @pet.color
json.weight @pet.weight
json.microchip_number @pet.microchip_number
json.special_notes @pet.special_notes
json.active @pet.active

json.owner do
  json.id @pet.user.id
  json.name @pet.user.full_name
  json.first_name @pet.user.first_name
  json.last_name @pet.user.last_name
  json.email @pet.user.email
  json.phone @pet.user.phone
end

json.appointments_count @pet.appointments.count
json.medical_records_count @pet.medical_records.count
json.vaccinations_count @pet.vaccinations.count
json.documents_count @pet.documents.count

json.next_vaccination_due @pet.next_vaccination_due

json.created_at @pet.created_at
json.updated_at @pet.updated_at
