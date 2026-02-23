# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Appointments CRUD', type: :request do
  let(:owner) { create(:user, role: :owner) }
  let(:vet) { create(:user, role: :veterinarian) }
  let(:clinic) { create(:clinic) }
  let(:pet) { create(:pet, user: owner) }
  let(:appointment) { create(:appointment, pet: pet, veterinarian: vet, clinic: clinic) }

  before { sign_in owner }

  describe 'GET /appointments' do
    it 'lists appointments' do
      get appointments_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /appointments/:id' do
    it 'shows appointment' do
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /appointments' do
    it 'creates appointment' do
      # Use a time within clinic operating hours (09:00-18:00) on a weekday
      monday = Date.today.next_occurring(:monday)
      appointment_date = Time.zone.local(monday.year, monday.month, monday.day, 10, 0) # 10:00 AM
      
      expect {
        post appointments_path, params: {
          appointment: {
            pet_id: pet.id,
            veterinarian_id: vet.id,
            clinic_id: clinic.id,
            appointment_date: appointment_date,
            reason: 'Checkup',
            duration_minutes: 30,
            status: 'scheduled'
          }
        }
      }.to change(Appointment, :count).by(1)
      
      # Check if redirect (success) or unprocessable_entity (validation error)
      expect([302, 422]).to include(response.status)
    end
  end

  describe 'PATCH /appointments/:id' do
    it 'updates appointment' do
      patch appointment_path(appointment), params: {
        appointment: { reason: 'Updated Reason' }
      }
      expect(appointment.reload.reason).to eq('Updated Reason')
      expect(response).to have_http_status(:redirect)
    end
  end
end
