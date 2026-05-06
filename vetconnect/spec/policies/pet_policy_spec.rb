# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PetPolicy do
  subject { described_class }

  let(:owner) { create(:user, role: :owner) }
  let(:other_owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }
  
  let(:pet) { create(:pet, user: owner) }
  let(:other_pet) { create(:pet, user: other_owner) }

  describe 'Scope' do
    let!(:owner_pets) { create_list(:pet, 3, user: owner) }
    let!(:other_pets) { create_list(:pet, 2, user: other_owner) }

    context 'as owner' do
      it 'only shows own pets' do
        scope = Pundit.policy_scope(owner, Pet)
        expect(scope.to_a).to match_array(owner_pets)
        expect(scope).not_to include(*other_pets)
      end
    end

    context 'as veterinarian' do
      it 'shows all pets' do
        scope = Pundit.policy_scope(veterinarian, Pet)
        expect(scope.to_a).to match_array(owner_pets + other_pets)
      end
    end

    context 'as admin' do
      it 'shows all pets' do
        scope = Pundit.policy_scope(admin, Pet)
        expect(scope.to_a).to match_array(owner_pets + other_pets)
      end
    end
  end

  permissions :index? do
    it 'allows any authenticated user' do
      expect(subject).to permit(owner, Pet)
      expect(subject).to permit(veterinarian, Pet)
      expect(subject).to permit(admin, Pet)
    end
  end

  permissions :show? do
    it 'allows owner to view their own pet' do
      expect(subject).to permit(owner, pet)
    end

    it 'allows veterinarian to view any pet' do
      expect(subject).to permit(veterinarian, pet)
      expect(subject).to permit(veterinarian, other_pet)
    end

    it 'allows admin to view any pet' do
      expect(subject).to permit(admin, pet)
      expect(subject).to permit(admin, other_pet)
    end

    it 'denies other owners from viewing the pet' do
      expect(subject).not_to permit(other_owner, pet)
    end
  end

  permissions :create? do
    it 'allows owners to create pets' do
      expect(subject).to permit(owner, Pet.new(user: owner))
    end

    it 'denies veterinarians from creating pets' do
      expect(subject).not_to permit(veterinarian, Pet.new)
    end

    it 'denies admins from creating pets' do
      expect(subject).not_to permit(admin, Pet.new)
    end
  end

  permissions :update? do
    it 'allows owner to update their own pet' do
      expect(subject).to permit(owner, pet)
    end

    it 'denies owner from updating other pets' do
      expect(subject).not_to permit(owner, other_pet)
    end

    it 'denies veterinarians from updating pets' do
      expect(subject).not_to permit(veterinarian, pet)
    end

    it 'denies admins from updating pets' do
      expect(subject).not_to permit(admin, pet)
    end
  end

  permissions :destroy? do
    it 'allows owner to delete their own pet' do
      expect(subject).to permit(owner, pet)
    end

    it 'denies owner from deleting other pets' do
      expect(subject).not_to permit(owner, other_pet)
    end

    it 'denies veterinarians from deleting pets' do
      expect(subject).not_to permit(veterinarian, pet)
    end

    it 'denies admins from deleting pets' do
      expect(subject).not_to permit(admin, pet)
    end
  end

  permissions :view_medical_history? do
    it 'allows owner to view their pet medical history' do
      expect(subject).to permit(owner, pet)
    end

    it 'allows veterinarian to view any pet medical history' do
      expect(subject).to permit(veterinarian, pet)
    end

    it 'allows admin to view any pet medical history' do
      expect(subject).to permit(admin, pet)
    end

    it 'denies other owners' do
      expect(subject).not_to permit(other_owner, pet)
    end
  end
end
