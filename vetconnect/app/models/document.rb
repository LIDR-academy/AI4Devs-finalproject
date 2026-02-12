# frozen_string_literal: true

class Document < ApplicationRecord
  # Associations
  belongs_to :pet
  belongs_to :uploaded_by, class_name: 'User'
  belongs_to :medical_record, optional: true

  # Validations
  validates :title, presence: true, length: { minimum: 2, maximum: 100 }
  validates :document_type, presence: true, inclusion: {
    in: %w[lab_result x_ray prescription vaccine_record invoice other]
  }
  validates :file_name, presence: true
  validates :file_size, numericality: { greater_than: 0, less_than_or_equal_to: 10.megabytes }, allow_blank: true

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(document_type: type) }
  scope :for_pet, ->(pet_id) { where(pet_id: pet_id) }

  # Instance methods
  def owner
    pet.user
  end

  def display_name
    "#{title} (#{document_type.titleize})"
  end

  def file_size_in_mb
    return nil unless file_size
    (file_size.to_f / 1.megabyte).round(2)
  end
end
