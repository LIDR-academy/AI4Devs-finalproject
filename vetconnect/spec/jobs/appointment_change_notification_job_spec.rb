# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppointmentChangeNotificationJob, type: :job do
  describe '#perform' do
    let(:clinic) { create(:clinic) }
    let(:appointment) { create(:appointment, clinic: clinic, appointment_date: 1.day.from_now) }

    it 'sends rescheduling email for valid appointment' do
      expect {
        described_class.perform_now(appointment.id)
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'does not send email for cancelled appointments' do
      appointment.update(status: :cancelled)
      
      expect {
        described_class.perform_now(appointment.id)
      }.not_to change { ActionMailer::Base.deliveries.count }
    end

    it 'does not send email for completed appointments' do
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
  end
end
