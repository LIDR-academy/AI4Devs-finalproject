# frozen_string_literal: true

FactoryBot.define do
  factory :vaccination do
    association :pet
    association :veterinarian, factory: :user, role: :veterinarian
    vaccine_name { 'Nobivac Rabia' }
    vaccine_type { 'rabies' }
    administered_at { 3.months.ago }
    dose_number { 1 }
    next_due_date { 9.months.from_now }
    manufacturer { 'MSD Animal Health' }
    lot_number { "LOT#{Faker::Alphanumeric.alphanumeric(number: 8).upcase}" }

    trait :overdue do
      next_due_date { 1.month.ago }
    end

    trait :due_soon do
      next_due_date { 2.weeks.from_now }
    end

    trait :dhpp do
      vaccine_name { 'Nobivac DHPP' }
      vaccine_type { 'dhpp' }
      dose_number { 1 }
      next_due_date { 3.weeks.from_now }
    end

    trait :feline_distemper do
      association :pet, species: :cat
      vaccine_name { 'Nobivac FVRCP' }
      vaccine_type { 'feline_distemper' }
      dose_number { 1 }
      next_due_date { 3.weeks.from_now }
    end

    trait :with_medical_record do
      association :medical_record
    end
  end
end
