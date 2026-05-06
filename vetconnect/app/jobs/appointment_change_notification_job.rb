# frozen_string_literal: true

# Job to notify users when appointment date/time changes
class AppointmentChangeNotificationJob < ApplicationJob
  queue_as :default

  def perform(appointment_id)
    appointment = Appointment.find_by(id: appointment_id)
    
    return unless appointment
    return if appointment.status_cancelled? || appointment.status_completed?
    
    # Send rescheduling notification email
    AppointmentMailer.rescheduled(appointment).deliver_now
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn("AppointmentChangeNotificationJob: Appointment #{appointment_id} not found")
  end
end
