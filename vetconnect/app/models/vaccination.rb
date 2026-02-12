# frozen_string_literal: true

# Model representing a vaccination record for a pet
class Vaccination < ApplicationRecord
  # Associations
  belongs_to :pet
  belongs_to :veterinarian, class_name: 'User'
  belongs_to :medical_record, optional: true
  
  # Enums
  enum vaccine_type: {
    rabies: 'rabies',
    dhpp: 'dhpp',
    bordetella: 'bordetella',
    leptospirosis: 'leptospirosis',
    feline_distemper: 'feline_distemper',
    feline_leukemia: 'feline_leukemia',
    other: 'other'
  }, _prefix: :type
  
  # Validations
  validates :vaccine_name, presence: true, length: { maximum: 100 }
  validates :vaccine_type, presence: true
  validates :administered_at, presence: true
  validates :dose_number, presence: true, numericality: { 
    only_integer: true, 
    greater_than: 0 
  }
  validates :veterinarian_id, presence: true
  
  validate :administered_date_not_in_future
  validate :expires_after_administered
  validate :veterinarian_is_vet_or_admin
  validate :next_due_date_after_administered
  
  # Scopes
  scope :recent, -> { order(administered_at: :desc) }
  scope :upcoming, -> { where('next_due_date >= ?', Date.today).order(:next_due_date) }
  scope :overdue, -> { where('next_due_date < ?', Date.today).order(:next_due_date) }
  scope :due_soon, -> { 
    where('next_due_date BETWEEN ? AND ?', Date.today, 30.days.from_now)
      .order(:next_due_date)
  }
  scope :for_pet, ->(pet_id) { where(pet_id: pet_id) }
  scope :for_vaccine_type, ->(type) { where(vaccine_type: type) }
  scope :by_veterinarian, ->(vet_id) { where(veterinarian_id: vet_id) }
  
  # Callbacks
  before_save :calculate_next_due_date, if: :should_calculate_next_due_date?
  
  # Instance methods
  def overdue?
    next_due_date.present? && next_due_date < Date.today
  end
  
  def due_soon?
    return false unless next_due_date.present?
    next_due_date >= Date.today && next_due_date <= 30.days.from_now
  end
  
  def owner
    pet.user
  end
  
  def display_name
    "#{vaccine_name} (#{vaccine_type.humanize})"
  end
  
  def days_until_due
    return nil unless next_due_date.present?
    (next_due_date - Date.today).to_i
  end
  
  private
  
  def administered_date_not_in_future
    if administered_at.present? && administered_at > Date.today
      errors.add(:administered_at, "no puede ser en el futuro")
    end
  end
  
  def expires_after_administered
    if expires_at.present? && administered_at.present? && expires_at <= administered_at
      errors.add(:expires_at, "debe ser posterior a la fecha de administración")
    end
  end
  
  def veterinarian_is_vet_or_admin
    if veterinarian.present? && !veterinarian.veterinarian? && !veterinarian.admin?
      errors.add(:veterinarian, "debe ser un veterinario o administrador")
    end
  end
  
  def next_due_date_after_administered
    if next_due_date.present? && administered_at.present? && next_due_date < administered_at
      errors.add(:next_due_date, "debe ser posterior a la fecha de administración")
    end
  end
  
  def should_calculate_next_due_date?
    next_due_date.blank? && administered_at.present? && vaccine_type.present? && dose_number.present?
  end
  
  def calculate_next_due_date
    return unless pet.present?
    
    protocol = VaccinationProtocol.find_protocol(
      species: pet.species,
      vaccine_type: vaccine_type,
      dose_number: dose_number + 1
    )
    
    if protocol
      self.next_due_date = administered_at + protocol.next_dose_interval_weeks.weeks
    else
      # Default: 1 year for annual vaccines, 3 weeks for multi-dose series
      default_interval = vaccine_type == 'rabies' ? 52 : 3
      self.next_due_date = administered_at + default_interval.weeks
    end
  end
end
