# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Appointment, type: :model do
  describe 'associations' do
    it { should belong_to(:pet) }
    it { should belong_to(:veterinarian).class_name('User') }
    it { should belong_to(:clinic) }
  end

  describe 'validations' do
    it { should validate_presence_of(:appointment_date) }
    it { should validate_presence_of(:reason) }
    it { should validate_presence_of(:duration_minutes) }
  end

  describe 'CRUD operations' do
    let(:pet) { create(:pet) }
    let(:vet) { create(:user, role: :veterinarian) }
    let(:clinic) { create(:clinic) }

    it 'can be created' do
      # Use factory which handles validations properly
      # Factory already sets appointment_date within business hours
      appointment = create(:appointment, 
        pet: pet,
        veterinarian: vet,
        clinic: clinic
      )
      expect(appointment).to be_persisted
      expect(appointment.errors).to be_empty
    end

    it 'can be read' do
      appointment = create(:appointment, pet: pet, veterinarian: vet, clinic: clinic)
      found = Appointment.find(appointment.id)
      expect(found.reason).to eq(appointment.reason)
    end

    it 'can be updated' do
      appointment = create(:appointment, pet: pet, veterinarian: vet, clinic: clinic)
      appointment.update(reason: 'Updated Reason')
      expect(appointment.reload.reason).to eq('Updated Reason')
    end

    it 'can be deleted' do
      appointment = create(:appointment, pet: pet, veterinarian: vet, clinic: clinic)
      expect { appointment.destroy }.to change(Appointment, :count).by(-1)
    end
  end
end
