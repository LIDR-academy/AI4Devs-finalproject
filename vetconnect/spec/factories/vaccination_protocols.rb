# frozen_string_literal: true

FactoryBot.define do
  factory :vaccination_protocol do
    species { 'dog' }
    vaccine_type { 'rabies' }
    dose_number { 1 }
    minimum_age_weeks { 12 }
    next_dose_interval_weeks { 52 }
    description { 'Rabies vaccination protocol for dogs' }

    trait :dhpp do
      vaccine_type { 'dhpp' }
      dose_number { 1 }
      minimum_age_weeks { 6 }
      next_dose_interval_weeks { 4 }
    end

    trait :feline_distemper do
      species { 'cat' }
      vaccine_type { 'feline_distemper' }
      dose_number { 1 }
      minimum_age_weeks { 6 }
      next_dose_interval_weeks { 4 }
    end
  end
end
