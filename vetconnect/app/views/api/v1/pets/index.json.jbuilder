json.pets @pets do |pet|
  json.id pet.id
  json.name pet.name
  json.species pet.species
  json.breed pet.breed
  json.birth_date pet.birth_date
  json.age pet.age
  json.gender pet.gender
  json.color pet.color
  json.weight pet.weight
  json.microchip_number pet.microchip_number
  json.active pet.active
  json.owner do
    json.id pet.user.id
    json.name pet.user.full_name
    json.email pet.user.email
  end
  json.created_at pet.created_at
  json.updated_at pet.updated_at
end

json.meta do
  json.current_page @pets.current_page
  json.total_pages @pets.total_pages
  json.per_page @pets.limit_value
  json.total_count @pets.total_count
end
