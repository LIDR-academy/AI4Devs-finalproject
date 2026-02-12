# frozen_string_literal: true

FactoryBot.define do
  factory :pet do
    association :user, factory: :user, role: :owner
    name { Faker::Creature::Dog.name }
    species { Pet.species.keys.sample }
    breed { Faker::Creature::Dog.breed }
    birth_date { Faker::Date.between(from: 15.years.ago, to: 1.year.ago) }
    gender { Pet.genders.keys.sample }
    special_notes { Faker::Lorem.paragraph }
    microchip_number { Faker::Alphanumeric.alphanumeric(number: 15).upcase }
    weight { Faker::Number.between(from: 1.0, to: 100.0).round(2) }
    color { Faker::Color.color_name }
    active { true }

    trait :dog do
      species { :dog }
      breed { Faker::Creature::Dog.breed }
    end

    trait :cat do
      species { :cat }
      breed { %w[Persian Siamese Maine\ Coon British\ Shorthair Ragdoll].sample }
    end

    trait :bird do
      species { :bird }
      breed { %w[Parrot Canary Cockatiel Macaw].sample }
      weight { Faker::Number.between(from: 0.1, to: 2.0).round(2) }
    end

    trait :rabbit do
      species { :rabbit }
      breed { %w[Holland\ Lop Netherland\ Dwarf Rex Angora].sample }
      weight { Faker::Number.between(from: 1.0, to: 5.0).round(2) }
    end

    trait :reptile do
      species { :reptile }
      breed { %w[Iguana Gecko Bearded\ Dragon Python].sample }
    end

    trait :inactive do
      active { false }
    end

    trait :with_photo do
      after(:build) do |pet|
        pet.photo.attach(
          io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'test.jpg')),
          filename: 'test.jpg',
          content_type: 'image/jpeg'
        )
      end
    end

    trait :with_appointments do
      after(:create) do |pet|
        create_list(:appointment, 3, pet: pet)
      end
    end

    trait :with_medical_records do
      after(:create) do |pet|
        create_list(:medical_record, 2, pet: pet)
      end
    end

    trait :young do
      birth_date { Faker::Date.between(from: 1.year.ago, to: 6.months.ago) }
    end

    trait :old do
      birth_date { Faker::Date.between(from: 15.years.ago, to: 10.years.ago) }
    end
  end
end
