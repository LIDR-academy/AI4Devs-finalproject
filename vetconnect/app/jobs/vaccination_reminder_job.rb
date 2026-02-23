# frozen_string_literal: true

# Job to send vaccination reminders when vaccinations are due soon or overdue
class VaccinationReminderJob < ApplicationJob
  queue_as :default

  def perform(vaccination_id)
    vaccination = Vaccination.find_by(id: vaccination_id)
    
    # Skip if vaccination doesn't exist or doesn't have a next_due_date
    return unless vaccination
    return unless vaccination.next_due_date.present?
    
    # Only send if due soon (within 30 days) or overdue
    return unless vaccination.due_soon? || vaccination.overdue?
    
    # Send reminder email (we'll create the mailer next)
    # VaccinationMailer.reminder(vaccination).deliver_now
    
    Rails.logger.info("VaccinationReminderJob: Reminder sent for vaccination #{vaccination_id}")
  rescue ActiveRecord::RecordNotFound
    # Log and ignore if vaccination was deleted
    Rails.logger.warn("VaccinationReminderJob: Vaccination #{vaccination_id} not found")
  end
  
  # Class method to process all due vaccinations
  def self.process_due_vaccinations
    # Find vaccinations due in the next 30 days or overdue
    due_vaccinations = Vaccination
      .where('next_due_date BETWEEN ? AND ?', Date.today, 30.days.from_now)
      .or(Vaccination.where('next_due_date < ?', Date.today))
    
    due_vaccinations.find_each do |vaccination|
      perform_later(vaccination.id)
    end
    
    Rails.logger.info("VaccinationReminderJob: Processed #{due_vaccinations.count} due vaccinations")
  end
end
