# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    phone { "+1#{Faker::Number.number(digits: 10)}" }
    role { :owner }
    confirmed_at { Time.current }

    trait :owner do
      role { :owner }
    end

    trait :veterinarian do
      role { :veterinarian }
      first_name { "Dr. #{Faker::Name.first_name}" }
    end

    trait :admin do
      role { :admin }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end
  end
end
