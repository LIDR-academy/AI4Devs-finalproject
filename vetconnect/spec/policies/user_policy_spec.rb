# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserPolicy do
  subject { described_class }

  let(:owner) { create(:user, role: :owner) }
  let(:other_owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }

  describe 'Scope' do
    let!(:owners) { create_list(:user, 2, role: :owner) }
    let!(:vets) { create_list(:user, 2, role: :veterinarian) }
    let!(:admins) { create_list(:user, 1, role: :admin) }

    context 'as owner' do
      let(:owner) { owners.first }
      let(:pet) { create(:pet, user: owner) }
      let!(:appointment) { create(:appointment, pet: pet, veterinarian: vets.first) }

      it 'shows self and vets they have interacted with' do
        scope = Pundit.policy_scope(owner, User)
        expect(scope).to include(owner, vets.first)
        expect(scope).not_to include(vets.second, owners.second)
      end
    end

    context 'as veterinarian' do
      let(:vet) { vets.first }
      let(:pet) { create(:pet, user: owners.first) }
      let!(:appointment) { create(:appointment, pet: pet, veterinarian: vet) }

      it 'shows other vets, admins, and owners they have interacted with' do
        scope = Pundit.policy_scope(vet, User)
        expect(scope).to include(owners.first, vets.first, vets.second)
      end
    end

    context 'as admin' do
      it 'shows all users' do
        scope = Pundit.policy_scope(admin, User)
        expect(scope.to_a).to match_array(owners + vets + admins)
      end
    end
  end

  permissions :show? do
    it 'allows user to view their own profile' do
      expect(subject).to permit(owner, owner)
      expect(subject).to permit(veterinarian, veterinarian)
    end

    it 'allows admin to view any profile' do
      expect(subject).to permit(admin, owner)
      expect(subject).to permit(admin, veterinarian)
    end

    it 'denies owner from viewing other owners' do
      expect(subject).not_to permit(owner, other_owner)
    end
  end

  permissions :create? do
    it 'allows admin to create users' do
      expect(subject).to permit(admin, User.new)
    end

    it 'denies owner from creating users' do
      expect(subject).not_to permit(owner, User.new)
    end

    it 'denies veterinarian from creating users' do
      expect(subject).not_to permit(veterinarian, User.new)
    end
  end

  permissions :update? do
    it 'allows user to update their own profile' do
      expect(subject).to permit(owner, owner)
      expect(subject).to permit(veterinarian, veterinarian)
    end

    it 'allows admin to update any profile' do
      expect(subject).to permit(admin, owner)
      expect(subject).to permit(admin, veterinarian)
    end

    it 'denies user from updating other profiles' do
      expect(subject).not_to permit(owner, other_owner)
      expect(subject).not_to permit(veterinarian, owner)
    end
  end

  permissions :destroy? do
    it 'allows admin to delete users' do
      expect(subject).to permit(admin, owner)
      expect(subject).to permit(admin, veterinarian)
    end

    it 'denies admin from deleting themselves' do
      expect(subject).not_to permit(admin, admin)
    end

    it 'denies non-admin from deleting users' do
      expect(subject).not_to permit(owner, other_owner)
      expect(subject).not_to permit(veterinarian, owner)
    end
  end

  permissions :change_role? do
    it 'allows admin to change user roles' do
      expect(subject).to permit(admin, owner)
      expect(subject).to permit(admin, veterinarian)
    end

    it 'denies admin from changing their own role' do
      expect(subject).not_to permit(admin, admin)
    end

    it 'denies non-admin from changing roles' do
      expect(subject).not_to permit(owner, other_owner)
      expect(subject).not_to permit(veterinarian, owner)
    end
  end

  permissions :manage_clinic? do
    it 'allows admin to manage clinic' do
      expect(subject).to permit(admin, User.new)
    end

    it 'denies non-admin from managing clinic' do
      expect(subject).not_to permit(owner, User.new)
      expect(subject).not_to permit(veterinarian, User.new)
    end
  end

  permissions :view_reports? do
    it 'allows admin to view reports' do
      expect(subject).to permit(admin, User.new)
    end

    it 'denies non-admin from viewing reports' do
      expect(subject).not_to permit(owner, User.new)
      expect(subject).not_to permit(veterinarian, User.new)
    end
  end

  permissions :send_message? do
    it 'allows veterinarian to message owners' do
      expect(subject).to permit(veterinarian, owner)
    end

    it 'allows owner to message veterinarians' do
      expect(subject).to permit(owner, veterinarian)
    end

    it 'allows owner to message admins' do
      expect(subject).to permit(owner, admin)
    end

    it 'allows admin to message anyone' do
      expect(subject).to permit(admin, owner)
      expect(subject).to permit(admin, veterinarian)
    end

    it 'denies owner from messaging other owners' do
      expect(subject).not_to permit(owner, other_owner)
    end
  end
end
