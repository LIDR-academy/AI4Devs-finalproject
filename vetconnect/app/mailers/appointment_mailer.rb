# frozen_string_literal: true

# Mailer for appointment-related notifications
class AppointmentMailer < ApplicationMailer
  default from: 'noreply@vetconnect.com'

  # Send reminder 24 hours before appointment
  def reminder(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(
      to: @owner.email,
      subject: "Recordatorio: Cita para #{@pet.name} mañana"
    )
  end

  # Send confirmation when appointment is created
  def confirmation(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(
      to: @owner.email,
      subject: "Confirmación de cita para #{@pet.name}"
    )
  end

  # Send notification when appointment is cancelled
  def cancellation(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @clinic = appointment.clinic
    
    mail(
      to: @owner.email,
      subject: "Cita cancelada para #{@pet.name}"
    )
  end

  # Send notification when appointment is rescheduled
  def rescheduled(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(
      to: @owner.email,
      subject: "Cita reprogramada para #{@pet.name}"
    )
  end
end
