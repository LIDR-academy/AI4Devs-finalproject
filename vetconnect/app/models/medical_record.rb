# frozen_string_literal: true

class MedicalRecord < ApplicationRecord
  # Associations
  belongs_to :pet
  belongs_to :veterinarian, class_name: 'User'
  belongs_to :appointment, optional: true
  has_many :documents, dependent: :nullify
  has_many :vaccinations, dependent: :nullify

  # Validations
  validates :visit_date, presence: true
  validates :record_type, presence: true, inclusion: {
    in: %w[consultation vaccination surgery emergency dental other]
  }
  validates :diagnosis, presence: true
  validate :veterinarian_is_vet

  # Scopes
  scope :recent, -> { order(visit_date: :desc) }
  scope :by_type, ->(type) { where(record_type: type) }
  scope :for_pet, ->(pet_id) { where(pet_id: pet_id) }

  # Instance methods
  def owner
    pet.user
  end

  def display_title
    "#{record_type.titleize} - #{visit_date.strftime('%B %d, %Y')}"
  end

  private

  def veterinarian_is_vet
    if veterinarian.present? && !veterinarian.veterinarian? && !veterinarian.admin?
      errors.add(:veterinarian, 'must be a veterinarian or admin')
    end
  end
end
