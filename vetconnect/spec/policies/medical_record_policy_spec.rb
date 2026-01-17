# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MedicalRecordPolicy do
  subject { described_class }

  let(:owner) { create(:user, role: :owner) }
  let(:other_owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }
  
  let(:pet) { create(:pet, user: owner) }
  let(:other_pet) { create(:pet, user: other_owner) }
  
  let(:medical_record) { create(:medical_record, pet: pet, veterinarian: veterinarian) }
  let(:other_medical_record) { create(:medical_record, pet: other_pet, veterinarian: veterinarian) }

  describe 'Scope' do
    let!(:owner_records) { create_list(:medical_record, 2, pet: pet, veterinarian: veterinarian) }
    let!(:other_records) { create_list(:medical_record, 2, pet: other_pet, veterinarian: veterinarian) }

    context 'as owner' do
      it 'only shows medical records for own pets' do
        scope = Pundit.policy_scope(owner, MedicalRecord)
        expect(scope.to_a).to match_array(owner_records)
        expect(scope).not_to include(*other_records)
      end
    end

    context 'as veterinarian' do
      it 'shows all medical records' do
        scope = Pundit.policy_scope(veterinarian, MedicalRecord)
        expect(scope.to_a).to match_array(owner_records + other_records)
      end
    end

    context 'as admin' do
      it 'shows all medical records' do
        scope = Pundit.policy_scope(admin, MedicalRecord)
        expect(scope.to_a).to match_array(owner_records + other_records)
      end
    end
  end

  permissions :show? do
    it 'allows pet owner to view medical record' do
      expect(subject).to permit(owner, medical_record)
    end

    it 'allows veterinarian to view any medical record' do
      expect(subject).to permit(veterinarian, medical_record)
      expect(subject).to permit(veterinarian, other_medical_record)
    end

    it 'allows admin to view any medical record' do
      expect(subject).to permit(admin, medical_record)
      expect(subject).to permit(admin, other_medical_record)
    end

    it 'denies other owners from viewing medical record' do
      expect(subject).not_to permit(other_owner, medical_record)
    end
  end

  permissions :create? do
    it 'allows veterinarian to create medical records' do
      expect(subject).to permit(veterinarian, MedicalRecord.new)
    end

    it 'allows admin to create medical records' do
      expect(subject).to permit(admin, MedicalRecord.new)
    end

    it 'denies owner from creating medical records' do
      expect(subject).not_to permit(owner, MedicalRecord.new)
    end
  end

  permissions :update? do
    it 'allows veterinarian to update medical records' do
      expect(subject).to permit(veterinarian, medical_record)
    end

    it 'allows admin to update medical records' do
      expect(subject).to permit(admin, medical_record)
    end

    it 'denies owner from updating medical records' do
      expect(subject).not_to permit(owner, medical_record)
    end
  end

  permissions :destroy? do
    it 'denies everyone from deleting medical records' do
      expect(subject).not_to permit(owner, medical_record)
      expect(subject).not_to permit(veterinarian, medical_record)
      expect(subject).not_to permit(admin, medical_record)
    end
  end

  permissions :add_notes? do
    it 'allows veterinarian to add notes' do
      expect(subject).to permit(veterinarian, medical_record)
    end

    it 'allows admin to add notes' do
      expect(subject).to permit(admin, medical_record)
    end

    it 'denies owner from adding notes' do
      expect(subject).not_to permit(owner, medical_record)
    end
  end

  permissions :attach_documents? do
    it 'allows veterinarian to attach documents' do
      expect(subject).to permit(veterinarian, medical_record)
    end

    it 'allows admin to attach documents' do
      expect(subject).to permit(admin, medical_record)
    end

    it 'denies owner from attaching documents' do
      expect(subject).not_to permit(owner, medical_record)
    end
  end
end
