# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Appointment Flow', type: :request do
  let!(:clinic) { create(:clinic) }
  let!(:owner) { create(:user, role: :owner) }
  let!(:veterinarian) { create(:user, role: :veterinarian) }
  let!(:admin) { create(:user, role: :admin) }
  let!(:pet) { create(:pet, user: owner) }

  describe 'Complete appointment lifecycle' do
    it 'allows owner to create, view, and cancel appointment' do
      sign_in owner
      
      # Check available slots
      monday = Date.today.next_occurring(:monday)
      get available_slots_appointments_path(veterinarian_id: veterinarian.id, date: monday, clinic_id: clinic.id)
      
      expect(response).to have_http_status(:success)
      slots_data = JSON.parse(response.body)
      expect(slots_data['slots']).to be_an(Array)
      expect(slots_data['slots']).not_to be_empty
      
      # Create appointment
      apt_date = Time.zone.local(monday.year, monday.month, monday.day, 10, 0)
      post appointments_path, params: {
        appointment: {
          pet_id: pet.id,
          veterinarian_id: veterinarian.id,
          clinic_id: clinic.id,
          appointment_date: apt_date,
          duration_minutes: 30,
          reason: 'Chequeo general',
          appointment_type: 'consultation'
        }
      }
      
      expect(response).to have_http_status(:redirect)
      follow_redirect!
      expect(response.body).to include('Cita creada exitosamente')
      
      appointment = Appointment.last
      expect(appointment.pet).to eq(pet)
      expect(appointment.status).to eq('scheduled')
      
      # View appointment
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
      expect(response.body).to include(pet.name)
      
      # Cancel appointment
      post cancel_appointment_path(appointment), params: {
        cancellation_reason: 'Cambio de planes'
      }
      
      expect(response).to have_http_status(:redirect)
      expect(appointment.reload.status).to eq('cancelled')
      expect(appointment.cancellation_reason).to eq('Cambio de planes')
    end

    it 'allows veterinarian to complete appointment' do
      sign_in veterinarian
      
      monday = Date.today.next_occurring(:monday)
      apt_date = Time.zone.local(monday.year, monday.month, monday.day, 14, 0)
      
      appointment = create(:appointment,
        pet: pet,
        veterinarian: veterinarian,
        clinic: clinic,
        appointment_date: apt_date,
        duration_minutes: 30,
        reason: 'Control',
        appointment_type: 'checkup'
      )
      
      # View appointment
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
      
      # Complete appointment
      post complete_appointment_path(appointment)
      
      expect(response).to have_http_status(:redirect)
      expect(appointment.reload.status).to eq('completed')
    end

    it 'prevents overlapping appointments' do
      sign_in owner
      
      monday = Date.today.next_occurring(:monday)
      apt_date = Time.zone.local(monday.year, monday.month, monday.day, 10, 0)
      
      # Create first appointment
      appointment1 = create(:appointment,
        pet: pet,
        veterinarian: veterinarian,
        clinic: clinic,
        appointment_date: apt_date,
        duration_minutes: 30
      )
      
      # Try to create overlapping appointment
      post appointments_path, params: {
        appointment: {
          pet_id: pet.id,
          veterinarian_id: veterinarian.id,
          clinic_id: clinic.id,
          appointment_date: apt_date + 15.minutes,
          duration_minutes: 30,
          reason: 'Another checkup',
          appointment_type: 'consultation'
        }
      }
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('veterinario ya tiene una cita')
    end

    it 'validates clinic operating hours' do
      sign_in owner
      
      sunday = Date.today.next_occurring(:sunday)
      apt_date = Time.zone.local(sunday.year, sunday.month, sunday.day, 10, 0)
      
      post appointments_path, params: {
        appointment: {
          pet_id: pet.id,
          veterinarian_id: veterinarian.id,
          clinic_id: clinic.id,
          appointment_date: apt_date,
          duration_minutes: 30,
          reason: 'Checkup',
          appointment_type: 'consultation'
        }
      }
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('cerrada ese día')
    end
  end

  describe 'Role-based access control' do
    let!(:appointment) do
      monday = Date.today.next_occurring(:monday)
      apt_date = Time.zone.local(monday.year, monday.month, monday.day, 11, 0)
      
      create(:appointment,
        pet: pet,
        veterinarian: veterinarian,
        clinic: clinic,
        appointment_date: apt_date
      )
    end

    it 'allows owner to view their pet appointments' do
      sign_in owner
      
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
    end

    it 'denies owner from viewing other pet appointments' do
      other_owner = create(:user, role: :owner)
      sign_in other_owner
      
      get appointment_path(appointment)
      expect(response).to have_http_status(:redirect)
    end

    it 'allows veterinarian to view all appointments' do
      sign_in veterinarian
      
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
    end

    it 'allows admin to view all appointments' do
      sign_in admin
      
      get appointment_path(appointment)
      expect(response).to have_http_status(:success)
    end
  end
end
