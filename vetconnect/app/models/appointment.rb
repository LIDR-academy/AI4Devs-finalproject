# frozen_string_literal: true

class Appointment < ApplicationRecord
  # Associations
  belongs_to :pet
  belongs_to :veterinarian, class_name: 'User'
  belongs_to :clinic
  has_one :medical_record, dependent: :nullify
  has_one :owner, through: :pet, source: :user

  # Enums - Updated status values
  enum status: {
    scheduled: 0,
    confirmed: 1,
    completed: 2,
    cancelled: 3,
    no_show: 4
  }, _prefix: true

  # Validations
  validates :appointment_date, presence: true
  validates :duration_minutes, presence: true, 
            numericality: { 
              only_integer: true,
              greater_than_or_equal_to: 15, 
              less_than_or_equal_to: 180 
            }
  validates :status, presence: true
  validates :reason, presence: true, length: { maximum: 200 }
  
  # Custom validations
  validate :appointment_date_cannot_be_in_past, on: :create
  validate :veterinarian_must_be_vet_or_admin
  validate :veterinarian_available_at_time
  validate :within_clinic_operating_hours

  # Scopes
  scope :upcoming, -> { where('appointment_date >= ?', Time.current).order(:appointment_date) }
  scope :past, -> { where('appointment_date < ?', Time.current).order(appointment_date: :desc) }
  scope :today, -> { where('DATE(appointment_date) = ?', Date.today) }
  scope :this_week, -> { 
    where(appointment_date: Time.current.beginning_of_week..Time.current.end_of_week) 
  }
  scope :pending_reminder, -> { 
    where(status: [:scheduled, :confirmed])
      .where(reminder_sent_at: nil)
      .where('appointment_date BETWEEN ? AND ?', 24.hours.from_now, 25.hours.from_now)
  }
  scope :for_veterinarian, ->(vet_id) { where(veterinarian_id: vet_id) }
  scope :for_clinic, ->(clinic_id) { where(clinic_id: clinic_id) }
  scope :active, -> { where(status: [:scheduled, :confirmed]) }
  scope :for_date, ->(date) { where('DATE(appointment_date) = ?', date) }

  # Callbacks
  after_create :schedule_reminder
  after_update :notify_changes, if: :saved_change_to_appointment_date?

  # Instance methods
  def end_time
    appointment_date + duration_minutes.minutes
  end

  def completed?
    status_completed?
  end

  def can_be_cancelled?
    status_scheduled? || status_confirmed?
  end

  def can_be_rescheduled?
    status_scheduled? || status_confirmed?
  end

  def cancel!(reason = nil)
    return false unless can_be_cancelled?
    update(status: :cancelled, cancellation_reason: reason)
  end

  def complete!
    update(status: :completed)
  end

  def confirm!
    update(status: :confirmed)
  end

  def mark_no_show!
    update(status: :no_show)
  end

  def reschedule!(new_date)
    return false unless can_be_rescheduled?
    update(appointment_date: new_date, reminder_sent_at: nil)
  end

  def send_reminder!
    AppointmentReminderJob.perform_later(id)
    update(reminder_sent_at: Time.current)
  end

  # Class method for calculating available slots
  def self.available_slots(veterinarian_id, date, clinic_id)
    clinic = Clinic.find(clinic_id)
    existing_appointments = where(
      veterinarian_id: veterinarian_id,
      appointment_date: date.beginning_of_day..date.end_of_day
    ).where.not(status: [:cancelled, :no_show])
    
    AvailabilityCalculator.new(clinic, veterinarian_id, date, existing_appointments).calculate
  end

  private

  def appointment_date_cannot_be_in_past
    if appointment_date.present? && appointment_date < Time.current
      errors.add(:appointment_date, "no puede ser en el pasado")
    end
  end

  def veterinarian_must_be_vet_or_admin
    if veterinarian.present? && !veterinarian.veterinarian? && !veterinarian.admin?
      errors.add(:veterinarian, "debe ser un veterinario o administrador")
    end
  end

  def veterinarian_available_at_time
    return if appointment_date.blank? || veterinarian_id.blank?
    return if persisted? && !appointment_date_changed?
    
    # Check for overlapping appointments using interval logic
    # Two appointments overlap if: (start1 < end2) AND (end1 > start2)
    # We need to check in Ruby due to SQLite datetime limitations
    overlapping_appointments = Appointment
      .where(veterinarian_id: veterinarian_id)
      .where.not(id: id)
      .where.not(status: [:cancelled, :no_show])
      .where('appointment_date >= ? AND appointment_date <= ?',
             appointment_date - 4.hours, appointment_date + 4.hours)
    
    # Check each appointment for actual overlap
    overlapping_appointments.each do |apt|
      apt_end = apt.end_time
      # Check if intervals overlap: (start1 < end2) AND (end1 > start2)
      if (appointment_date < apt_end) && (end_time > apt.appointment_date)
        errors.add(:appointment_date, "el veterinario ya tiene una cita en ese horario")
        break
      end
    end
  end

  def within_clinic_operating_hours
    return if appointment_date.blank? || clinic.blank?
    
    day_of_week = appointment_date.strftime('%A').downcase
    operating_hours = clinic.operating_hours[day_of_week]
    
    if operating_hours.blank? || !operating_hours['open']
      errors.add(:appointment_date, "la clínica está cerrada ese día")
      return
    end
    
    time = appointment_date.strftime('%H:%M')
    appointment_end_time = end_time.strftime('%H:%M')
    
    if time < operating_hours['start'] || appointment_end_time > operating_hours['end']
      errors.add(
        :appointment_date, 
        "fuera del horario de atención (#{operating_hours['start']} - #{operating_hours['end']})"
      )
    end
  end

  def schedule_reminder
    # Schedule a job to run 24 hours before the appointment
    if appointment_date > 24.hours.from_now
      AppointmentReminderJob.set(wait_until: appointment_date - 24.hours).perform_later(id)
    end
  end

  def notify_changes
    AppointmentChangeNotificationJob.perform_later(id)
  end
end
