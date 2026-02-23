# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Pets CRUD', type: :request do
  let(:owner) { create(:user, role: :owner) }
  let(:pet) { create(:pet, user: owner) }

  before { sign_in owner }

  describe 'GET /pets' do
    it 'lists pets' do
      get pets_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /pets/:id' do
    it 'shows pet' do
      get pet_path(pet)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /pets' do
    it 'creates pet' do
      expect {
        post pets_path, params: {
          pet: {
            name: 'New Pet',
            species: 'dog',
            birth_date: 2.years.ago,
            gender: 'male'
          }
        }
      }.to change(Pet, :count).by(1)
      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'PATCH /pets/:id' do
    it 'updates pet' do
      patch pet_path(pet), params: {
        pet: { name: 'Updated Name' }
      }
      expect(pet.reload.name).to eq('Updated Name')
      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'DELETE /pets/:id' do
    it 'deletes pet' do
      delete pet_path(pet)
      expect(pet.reload.active).to be false
      expect(response).to have_http_status(:redirect)
    end
  end
end
