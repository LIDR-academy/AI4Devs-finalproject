# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pet, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
    it { should have_many(:appointments).dependent(:destroy) }
    it { should have_many(:medical_records).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:pet) }

    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:species) }
    it { should validate_presence_of(:birth_date) }
    it { should validate_presence_of(:gender) }
  end

  describe 'CRUD operations' do
    let(:user) { create(:user) }

    it 'can be created' do
      pet = Pet.create(
        name: 'Max',
        species: :dog,
        birth_date: 2.years.ago,
        gender: :male,
        user: user
      )
      expect(pet).to be_persisted
    end

    it 'can be read' do
      pet = create(:pet, user: user)
      found = Pet.find(pet.id)
      expect(found.name).to eq(pet.name)
    end

    it 'can be updated' do
      pet = create(:pet, user: user)
      pet.update(name: 'Updated Name')
      expect(pet.reload.name).to eq('Updated Name')
    end

    it 'can be deleted' do
      pet = create(:pet, user: user)
      expect { pet.destroy }.to change(Pet, :count).by(-1)
    end
  end
end
