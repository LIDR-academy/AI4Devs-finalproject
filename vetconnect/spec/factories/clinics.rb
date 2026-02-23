# frozen_string_literal: true

FactoryBot.define do
  factory :clinic do
    name { Faker::Company.name + " Veterinary Clinic" }
    address { Faker::Address.full_address }
    phone { "+1#{Faker::Number.number(digits: 10)}" }
    email { Faker::Internet.email }
    active { true }
    operating_hours do
      {
        'monday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
        'tuesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
        'wednesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
        'thursday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
        'friday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
        'saturday' => { 'open' => true, 'start' => '09:00', 'end' => '14:00' },
        'sunday' => { 'open' => false }
      }
    end

    trait :inactive do
      active { false }
    end

    trait :closed_weekends do
      operating_hours do
        {
          'monday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
          'tuesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
          'wednesday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
          'thursday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
          'friday' => { 'open' => true, 'start' => '09:00', 'end' => '18:00' },
          'saturday' => { 'open' => false },
          'sunday' => { 'open' => false }
        }
      end
    end

    trait :twentyfour_seven do
      operating_hours do
        {
          'monday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'tuesday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'wednesday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'thursday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'friday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'saturday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' },
          'sunday' => { 'open' => true, 'start' => '00:00', 'end' => '23:59' }
        }
      end
    end
  end
end
