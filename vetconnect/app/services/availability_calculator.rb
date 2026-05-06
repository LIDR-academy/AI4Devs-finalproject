# frozen_string_literal: true

# Service object to calculate available appointment slots for a veterinarian
# on a specific date, considering clinic operating hours and existing appointments
class AvailabilityCalculator
  SLOT_DURATION = 30 # minutes

  def initialize(clinic, veterinarian_id, date, existing_appointments)
    @clinic = clinic
    @veterinarian_id = veterinarian_id
    @date = date
    @existing_appointments = existing_appointments
  end

  def calculate
    return [] unless clinic_open?

    generate_slots
  end

  private

  attr_reader :clinic, :veterinarian_id, :date, :existing_appointments

  def clinic_open?
    @clinic.open_on?(@date)
  end

  def operating_hours
    @operating_hours ||= @clinic.operating_hours_for(@date)
  end

  def generate_slots
    slots = []
    current_time = start_time

    while current_time < end_time
      slot_end = current_time + SLOT_DURATION.minutes

      if available?(current_time, slot_end)
        slots << {
          start_time: current_time,
          end_time: slot_end,
          available: true
        }
      end

      current_time += SLOT_DURATION.minutes
    end

    slots
  end

  def start_time
    hour, minute = operating_hours['start'].split(':').map(&:to_i)
    Time.zone.local(@date.year, @date.month, @date.day, hour, minute)
  end

  def end_time
    hour, minute = operating_hours['end'].split(':').map(&:to_i)
    Time.zone.local(@date.year, @date.month, @date.day, hour, minute)
  end

  def available?(slot_start, slot_end)
    @existing_appointments.none? do |appointment|
      appointment_end = appointment.end_time
      # Check if slot overlaps with appointment: (start1 < end2) AND (end1 > start2)
      (slot_start < appointment_end) && (slot_end > appointment.appointment_date)
    end
  end
end
