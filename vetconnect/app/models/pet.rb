# frozen_string_literal: true

class Pet < ApplicationRecord
  # Active Storage
  has_one_attached :photo
  
  # Associations
  belongs_to :user
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :veterinarians, through: :appointments
  
  # Enumerations
  enum species: { 
    dog: 'dog', 
    cat: 'cat', 
    rabbit: 'rabbit', 
    bird: 'bird', 
    reptile: 'reptile',
    other: 'other' 
  }, _prefix: :species
  
  enum gender: { 
    male: 'male', 
    female: 'female', 
    unknown: 'unknown' 
  }, _prefix: :gender
  
  # Validations
  validates :name, presence: true, length: { minimum: 1, maximum: 50 }
  validates :species, presence: true
  validates :birth_date, presence: true
  validates :gender, presence: true
  validates :microchip_number, uniqueness: { case_sensitive: false }, allow_blank: true
  validates :weight, numericality: { greater_than: 0, less_than: 500 }, allow_nil: true
  
  # Custom validations
  validate :birth_date_cannot_be_in_future
  validate :birth_date_cannot_be_too_old
  validate :photo_format
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :by_species, ->(species) { where(species: species) }
  scope :recent, -> { order(created_at: :desc) }
  scope :alphabetical, -> { order(name: :asc) }
  
  # Instance methods
  def age
    return nil unless birth_date
    
    ((Date.today - birth_date) / 365.25).floor
  end
  
  def age_in_months
    return nil unless birth_date
    
    ((Date.today - birth_date) / 30.44).floor
  end
  
  def full_name
    "#{name} (#{species.humanize})"
  end
  
  def next_vaccination_due
    # TODO: Implement when Vaccination model is created
    nil
  end
  
  def recent_appointments(limit = 5)
    appointments.order(appointment_date: :desc).limit(limit)
  end
  
  def deactivate!
    update(active: false)
  end
  
  def activate!
    update(active: true)
  end
  
  # Legacy method for compatibility
  def display_name
    full_name
  end
  
  private
  
  def birth_date_cannot_be_in_future
    if birth_date.present? && birth_date > Date.today
      errors.add(:birth_date, "no puede ser en el futuro")
    end
  end
  
  def birth_date_cannot_be_too_old
    if birth_date.present? && birth_date < 30.years.ago
      errors.add(:birth_date, "es demasiado antigua (máximo 30 años)")
    end
  end
  
  def photo_format
    if photo.attached? && !photo.content_type.in?(%w[image/jpeg image/png image/jpg])
      errors.add(:photo, "debe ser JPEG o PNG")
    end
  end
end
