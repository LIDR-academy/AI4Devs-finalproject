# frozen_string_literal: true

# Job to send appointment reminders 24 hours before the scheduled time
class AppointmentReminderJob < ApplicationJob
  queue_as :default

  def perform(appointment_id)
    appointment = Appointment.find_by(id: appointment_id)
    
    # Skip if appointment doesn't exist or has been cancelled/completed
    return unless appointment
    return if appointment.status_cancelled? || appointment.status_completed?
    return if appointment.reminder_sent_at.present?
    
    # Send reminder email
    AppointmentMailer.reminder(appointment).deliver_now
    
    # Mark reminder as sent
    appointment.update_column(:reminder_sent_at, Time.current)
  rescue ActiveRecord::RecordNotFound
    # Log and ignore if appointment was deleted
    Rails.logger.warn("AppointmentReminderJob: Appointment #{appointment_id} not found")
  end
end
