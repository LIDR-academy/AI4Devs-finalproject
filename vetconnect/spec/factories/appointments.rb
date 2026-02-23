# frozen_string_literal: true

FactoryBot.define do
  factory :appointment do
    association :pet
    association :veterinarian, factory: :user, role: :veterinarian
    association :clinic
    
    # Generate appointment during business hours (10:00-16:00) on a weekday
    appointment_date do
      base_date = Faker::Time.between(from: 3.days.from_now, to: 30.days.from_now)
      # Ensure it's a weekday (Monday-Friday)
      while base_date.sunday? || base_date.saturday?
        base_date += 1.day
      end
      # Set time between 10:00 and 16:00
      base_date.change(hour: rand(10..15), min: [0, 30].sample)
    end
    
    duration_minutes { [30, 45, 60].sample }
    status { :scheduled }
    appointment_type { %w[consultation vaccination surgery checkup emergency].sample }
    reason { Faker::Lorem.sentence }
    notes { Faker::Lorem.paragraph }

    trait :scheduled do
      status { :scheduled }
    end

    trait :confirmed do
      status { :confirmed }
    end

    trait :completed do
      status { :completed }
      appointment_date do
        base_date = Faker::Time.between(from: 30.days.ago, to: 2.days.ago)
        while base_date.sunday? || base_date.saturday?
          base_date += 1.day
        end
        base_date.change(hour: rand(10..15), min: [0, 30].sample)
      end
      
      # Use after(:build) to skip validation on past dates for completed appointments
      after(:build) do |appointment|
        def appointment.appointment_date_cannot_be_in_past; end
      end
    end

    trait :cancelled do
      status { :cancelled }
      cancellation_reason { Faker::Lorem.sentence }
    end

    trait :no_show do
      status { :no_show }
      appointment_date do
        base_date = Faker::Time.between(from: 7.days.ago, to: 2.days.ago)
        while base_date.sunday? || base_date.saturday?
          base_date += 1.day
        end
        base_date.change(hour: rand(10..15), min: [0, 30].sample)
      end
    end

    trait :past do
      appointment_date do
        base_date = Faker::Time.between(from: 30.days.ago, to: 2.days.ago)
        while base_date.sunday? || base_date.saturday?
          base_date += 1.day
        end
        base_date.change(hour: rand(10..15), min: [0, 30].sample)
      end
    end

    trait :with_reminder_sent do
      reminder_sent_at { 1.day.ago }
    end
  end
end
