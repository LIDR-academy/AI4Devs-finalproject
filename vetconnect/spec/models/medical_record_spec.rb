# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MedicalRecord, type: :model do
  describe 'associations' do
    it { should belong_to(:pet) }
    it { should belong_to(:veterinarian).class_name('User') }
  end

  describe 'validations' do
    it { should validate_presence_of(:visit_date) }
    it { should validate_presence_of(:record_type) }
    it { should validate_presence_of(:diagnosis) }
  end

  describe 'CRUD operations' do
    let(:pet) { create(:pet) }
    let(:vet) { create(:user, role: :veterinarian) }

    it 'can be created' do
      record = MedicalRecord.create(
        pet: pet,
        veterinarian: vet,
        visit_date: Date.today,
        record_type: 'consultation',
        diagnosis: 'Healthy'
      )
      expect(record).to be_persisted
    end

    it 'can be read' do
      record = create(:medical_record, pet: pet, veterinarian: vet)
      found = MedicalRecord.find(record.id)
      expect(found.diagnosis).to eq(record.diagnosis)
    end

    it 'can be updated' do
      record = create(:medical_record, pet: pet, veterinarian: vet)
      record.update(diagnosis: 'Updated Diagnosis')
      expect(record.reload.diagnosis).to eq('Updated Diagnosis')
    end
  end
end
