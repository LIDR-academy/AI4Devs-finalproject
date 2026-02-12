# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Clinic, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:address) }
    it { should validate_presence_of(:phone) }
  end

  describe 'CRUD operations' do
    it 'can be created' do
      clinic = Clinic.create(
        name: 'Test Clinic',
        address: '123 Main St',
        phone: '+1-555-0123',
        email: 'test@clinic.com'
      )
      expect(clinic).to be_persisted
    end

    it 'can be read' do
      clinic = create(:clinic)
      found = Clinic.find(clinic.id)
      expect(found.name).to eq(clinic.name)
    end

    it 'can be updated' do
      clinic = create(:clinic)
      clinic.update(name: 'Updated Name')
      expect(clinic.reload.name).to eq('Updated Name')
    end

    it 'can be deleted' do
      clinic = create(:clinic)
      expect { clinic.destroy }.to change(Clinic, :count).by(-1)
    end
  end
end
