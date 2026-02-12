# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Vaccinations CRUD', type: :request do
  let(:vet) { create(:user, role: :veterinarian) }
  let(:pet) { create(:pet) }
  let(:vaccination) { create(:vaccination, pet: pet, veterinarian: vet) }

  before { sign_in vet }

  describe 'GET /vaccinations' do
    it 'lists vaccinations' do
      create(:vaccination, pet: pet, veterinarian: vet)
      get vaccinations_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /vaccinations/:id' do
    it 'shows vaccination' do
      get vaccination_path(vaccination)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /vaccinations' do
    it 'creates vaccination' do
      expect {
        post vaccinations_path, params: {
          vaccination: {
            pet_id: pet.id,
            veterinarian_id: vet.id,
            vaccine_name: 'Rabies',
            vaccine_type: 'rabies',
            administered_at: Date.today,
            dose_number: 1
          }
        }
      }.to change(Vaccination, :count).by(1)
      
      # Check if redirect (success) or unprocessable_entity (validation error)
      expect([302, 422]).to include(response.status)
    end
  end

  describe 'PATCH /vaccinations/:id' do
    it 'updates vaccination' do
      patch vaccination_path(vaccination), params: {
        vaccination: { vaccine_name: 'Updated Vaccine' }
      }
      expect(vaccination.reload.vaccine_name).to eq('Updated Vaccine')
      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'DELETE /vaccinations/:id' do
    it 'deletes vaccination' do
      # Vaccination created by vet, so vet should be able to delete
      expect(vaccination.veterinarian_id).to eq(vet.id)
      
      expect {
        delete vaccination_path(vaccination)
      }.to change(Vaccination, :count).by(-1)
      expect(response).to have_http_status(:redirect)
    end
  end
end
