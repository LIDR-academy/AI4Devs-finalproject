# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppointmentReminderJob, type: :job do
  describe '#perform' do
    let(:clinic) { create(:clinic) }
    let(:appointment) { create(:appointment, clinic: clinic, appointment_date: 1.day.from_now) }

    it 'sends reminder email for valid appointment' do
      expect {
        described_class.perform_now(appointment.id)
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
      
      expect(appointment.reload.reminder_sent_at).to be_present
    end

    it 'does not send reminder if already sent' do
      appointment.update(reminder_sent_at: 1.hour.ago)
      
      expect {
        described_class.perform_now(appointment.id)
      }.not_to change { ActionMailer::Base.deliveries.count }
    end

    it 'does not send reminder for cancelled appointments' do
      appointment.update(status: :cancelled)
      
      expect {
        described_class.perform_now(appointment.id)
      }.not_to change { ActionMailer::Base.deliveries.count }
    end

    it 'does not send reminder for completed appointments' do
      appointment.update(status: :completed)
      
      expect {
        described_class.perform_now(appointment.id)
      }.not_to change { ActionMailer::Base.deliveries.count }
    end

    it 'handles non-existent appointment gracefully' do
      expect {
        described_class.perform_now(99999)
      }.not_to raise_error
    end

    it 'updates reminder_sent_at timestamp' do
      travel_to Time.current do
        described_class.perform_now(appointment.id)
        
        expect(appointment.reload.reminder_sent_at).to be_within(1.second).of(Time.current)
      end
    end
  end
end
