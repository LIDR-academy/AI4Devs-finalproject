# frozen_string_literal: true

class Clinic < ApplicationRecord
  # Associations
  has_many :appointments, dependent: :restrict_with_error
  has_many :pets, through: :appointments
  has_many :veterinarians, -> { distinct }, through: :appointments

  # Serialize operating hours as JSON
  serialize :operating_hours, coder: JSON

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :address, presence: true, length: { minimum: 5, maximum: 500 }
  validates :phone, presence: true, 
                    format: { 
                      with: /\A\+?[0-9\s\-()]+\z/, 
                      message: "must be a valid phone number" 
                    },
                    length: { minimum: 10, maximum: 20 }
  validates :email, format: { 
    with: URI::MailTo::EMAIL_REGEXP,
    message: "must be a valid email address"
  }, allow_blank: true
  
  validate :operating_hours_format

  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  # Callbacks
  before_save :ensure_operating_hours_structure

  # Instance methods
  def open_on?(date)
    day_name = date.strftime('%A').downcase
    hours = operating_hours&.dig(day_name)
    hours.present? && hours['open'] == true
  end

  def operating_hours_for(date)
    day_name = date.strftime('%A').downcase
    operating_hours&.dig(day_name) || {}
  end

  def opening_time_for(date)
    hours = operating_hours_for(date)
    return nil unless hours['open']
    hours['start']
  end

  def closing_time_for(date)
    hours = operating_hours_for(date)
    return nil unless hours['open']
    hours['end']
  end

  def deactivate!
    update(active: false)
  end

  def activate!
    update(active: true)
  end

  def full_address
    address
  end

  private

  def operating_hours_format
    return if operating_hours.blank?
    
    unless operating_hours.is_a?(Hash)
      errors.add(:operating_hours, "must be a valid JSON object")
      return
    end

    valid_days = %w[monday tuesday wednesday thursday friday saturday sunday]
    
    operating_hours.each do |day, hours|
      unless valid_days.include?(day)
        errors.add(:operating_hours, "contains invalid day: #{day}")
        next
      end

      next unless hours.is_a?(Hash) && hours['open'] == true

      unless hours['start'].present? && hours['end'].present?
        errors.add(:operating_hours, "must include start and end times for #{day}")
      end

      # Validate time format (HH:MM)
      if hours['start'].present? && !hours['start'].match?(/\A([0-1]?[0-9]|2[0-3]):[0-5][0-9]\z/)
        errors.add(:operating_hours, "invalid start time format for #{day}")
      end

      if hours['end'].present? && !hours['end'].match?(/\A([0-1]?[0-9]|2[0-3]):[0-5][0-9]\z/)
        errors.add(:operating_hours, "invalid end time format for #{day}")
      end
    end
  end

  def ensure_operating_hours_structure
    self.operating_hours ||= default_operating_hours
  end

  def default_operating_hours
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
end
