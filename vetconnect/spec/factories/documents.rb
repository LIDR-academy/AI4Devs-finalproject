# frozen_string_literal: true

FactoryBot.define do
  factory :document do
    association :pet
    association :uploaded_by, factory: :user, role: :veterinarian
    medical_record { nil } # Optional association
    title { Faker::Lorem.sentence(word_count: 3) }
    document_type { %w[lab_result x_ray prescription vaccine_record invoice other].sample }
    description { Faker::Lorem.paragraph }
    file_name { "#{Faker::File.file_name(dir: '', ext: 'pdf')}" }
    file_path { "/uploads/documents/#{SecureRandom.uuid}.pdf" }
    content_type { 'application/pdf' }
    file_size { Faker::Number.between(from: 100.kilobytes, to: 5.megabytes) }

    trait :lab_result do
      document_type { 'lab_result' }
      title { 'Resultados de laboratorio' }
    end

    trait :x_ray do
      document_type { 'x_ray' }
      title { 'Radiografía' }
      content_type { 'image/jpeg' }
    end

    trait :prescription do
      document_type { 'prescription' }
      title { 'Receta médica' }
    end

    trait :uploaded_by_owner do
      association :uploaded_by, factory: :user, role: :owner
    end
  end
end
