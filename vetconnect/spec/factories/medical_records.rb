# frozen_string_literal: true

FactoryBot.define do
  factory :medical_record do
    association :pet
    association :veterinarian, factory: :user, role: :veterinarian
    association :appointment, optional: true
    visit_date { Faker::Date.between(from: 1.year.ago, to: Date.today) }
    record_type { %w[consultation vaccination surgery emergency dental other].sample }
    diagnosis { Faker::Lorem.paragraph }
    treatment { Faker::Lorem.paragraph }
    prescription { Faker::Lorem.sentence }
    notes { Faker::Lorem.paragraph }
    weight { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    temperature { Faker::Number.decimal(l_digits: 2, r_digits: 1) }

    trait :consultation do
      record_type { 'consultation' }
    end

    trait :vaccination do
      record_type { 'vaccination' }
    end

    trait :surgery do
      record_type { 'surgery' }
    end

    trait :emergency do
      record_type { 'emergency' }
    end
  end
end
