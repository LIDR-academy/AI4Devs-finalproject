# frozen_string_literal: true

# Model representing vaccination protocols for different species
# Defines standard vaccination schedules (what vaccines, when, intervals)
class VaccinationProtocol < ApplicationRecord
  # Validations
  validates :species, presence: true
  validates :vaccine_type, presence: true
  validates :dose_number, presence: true, numericality: { greater_than: 0 }
  validates :minimum_age_weeks, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :next_dose_interval_weeks, presence: true, numericality: { greater_than: 0 }
  
  validates :species, uniqueness: { 
    scope: [:vaccine_type, :dose_number],
    message: "protocol already exists for this species, vaccine type, and dose number"
  }
  
  # Scopes
  scope :for_species, ->(species) { where(species: species) }
  scope :for_vaccine_type, ->(type) { where(vaccine_type: type) }
  scope :by_dose_number, ->(dose) { where(dose_number: dose) }
  
  # Class methods
  def self.find_protocol(species:, vaccine_type:, dose_number:)
    find_by(
      species: species.to_s,
      vaccine_type: vaccine_type.to_s,
      dose_number: dose_number
    )
  end
  
  def self.next_dose_interval(species:, vaccine_type:, current_dose:)
    protocol = find_protocol(
      species: species,
      vaccine_type: vaccine_type,
      dose_number: current_dose + 1
    )
    protocol&.next_dose_interval_weeks
  end
  
  # Instance methods
  def minimum_age_days
    minimum_age_weeks * 7
  end
  
  def next_dose_interval_days
    next_dose_interval_weeks * 7
  end
end
