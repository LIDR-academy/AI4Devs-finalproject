# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vaccination, type: :model do
  describe 'associations' do
    it { should belong_to(:pet) }
    it { should belong_to(:veterinarian).class_name('User') }
  end

  describe 'validations' do
    it { should validate_presence_of(:vaccine_name) }
    it { should validate_presence_of(:vaccine_type) }
    it { should validate_presence_of(:administered_at) }
    it { should validate_presence_of(:dose_number) }
  end

  describe 'CRUD operations' do
    let(:pet) { create(:pet) }
    let(:vet) { create(:user, role: :veterinarian) }

    it 'can be created' do
      # Use factory which handles validations properly
      vaccination = create(:vaccination,
        pet: pet,
        veterinarian: vet,
        vaccine_name: 'Rabies',
        vaccine_type: 'rabies',
        administered_at: Date.today,
        dose_number: 1
      )
      expect(vaccination).to be_persisted
      expect(vaccination.errors).to be_empty
    end

    it 'can be read' do
      vaccination = create(:vaccination, pet: pet, veterinarian: vet)
      found = Vaccination.find(vaccination.id)
      expect(found.vaccine_name).to eq(vaccination.vaccine_name)
    end

    it 'can be updated' do
      vaccination = create(:vaccination, pet: pet, veterinarian: vet)
      vaccination.update(vaccine_name: 'Updated Vaccine')
      expect(vaccination.reload.vaccine_name).to eq('Updated Vaccine')
    end

    it 'can be deleted' do
      vaccination = create(:vaccination, pet: pet, veterinarian: vet)
      expect { vaccination.destroy }.to change(Vaccination, :count).by(-1)
    end
  end
end
