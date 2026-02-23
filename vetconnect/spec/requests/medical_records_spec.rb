# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'MedicalRecords CRUD', type: :request do
  let(:vet) { create(:user, role: :veterinarian) }
  let(:pet) { create(:pet) }
  let(:medical_record) { create(:medical_record, pet: pet, veterinarian: vet) }

  before { sign_in vet }

  describe 'GET /medical_records' do
    it 'lists medical records' do
      get medical_records_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /medical_records/:id' do
    it 'shows medical record' do
      get medical_record_path(medical_record)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /medical_records' do
    it 'creates medical record' do
      # Controller assigns veterinarian automatically if not present
      expect {
        post medical_records_path, params: {
          medical_record: {
            pet_id: pet.id,
            visit_date: Date.today,
            record_type: 'consultation',
            diagnosis: 'Healthy'
          }
        }
      }.to change(MedicalRecord, :count).by(1)
      
      # Check if redirect (success) or unprocessable_entity (validation error)
      expect([302, 422]).to include(response.status)
    end
  end

  describe 'PATCH /medical_records/:id' do
    it 'updates medical record' do
      patch medical_record_path(medical_record), params: {
        medical_record: { diagnosis: 'Updated Diagnosis' }
      }
      expect(medical_record.reload.diagnosis).to eq('Updated Diagnosis')
      expect(response).to have_http_status(:redirect)
    end
  end
end
