# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppointmentPolicy do
  subject { described_class }

  let(:owner) { create(:user, role: :owner) }
  let(:other_owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }
  
  let(:pet) { create(:pet, user: owner) }
  let(:other_pet) { create(:pet, user: other_owner) }
  
  let(:appointment) { create(:appointment, pet: pet, veterinarian: veterinarian) }
  let(:other_appointment) { create(:appointment, pet: other_pet, veterinarian: veterinarian) }
  let(:completed_appointment) { create(:appointment, :completed, pet: pet, veterinarian: veterinarian) }

  describe 'Scope' do
    let!(:owner_appointments) { create_list(:appointment, 2, pet: pet, veterinarian: veterinarian) }
    let!(:other_appointments) { create_list(:appointment, 2, pet: other_pet, veterinarian: veterinarian) }

    context 'as owner' do
      it 'only shows appointments for own pets' do
        scope = Pundit.policy_scope(owner, Appointment)
        expect(scope.to_a).to match_array(owner_appointments)
        expect(scope).not_to include(*other_appointments)
      end
    end

    context 'as veterinarian' do
      it 'shows all appointments' do
        scope = Pundit.policy_scope(veterinarian, Appointment)
        expect(scope.to_a).to match_array(owner_appointments + other_appointments)
      end
    end

    context 'as admin' do
      it 'shows all appointments' do
        scope = Pundit.policy_scope(admin, Appointment)
        expect(scope.to_a).to match_array(owner_appointments + other_appointments)
      end
    end
  end

  permissions :show? do
    it 'allows pet owner to view appointment' do
      expect(subject).to permit(owner, appointment)
    end

    it 'allows veterinarian to view any appointment' do
      expect(subject).to permit(veterinarian, appointment)
      expect(subject).to permit(veterinarian, other_appointment)
    end

    it 'allows admin to view any appointment' do
      expect(subject).to permit(admin, appointment)
    end

    it 'denies other owners from viewing appointment' do
      expect(subject).not_to permit(other_owner, appointment)
    end
  end

  permissions :create? do
    it 'allows owner to create appointment' do
      expect(subject).to permit(owner, Appointment.new)
    end

    it 'allows veterinarian to create appointment' do
      expect(subject).to permit(veterinarian, Appointment.new)
    end

    it 'allows admin to create appointment' do
      expect(subject).to permit(admin, Appointment.new)
    end
  end

  permissions :update? do
    it 'allows owner to update their pet appointment' do
      expect(subject).to permit(owner, appointment)
    end

    it 'denies owner from updating other pet appointments' do
      expect(subject).not_to permit(owner, other_appointment)
    end

    it 'allows veterinarian to update any appointment' do
      expect(subject).to permit(veterinarian, appointment)
    end

    it 'allows admin to update any appointment' do
      expect(subject).to permit(admin, appointment)
    end

    it 'denies updating completed appointments' do
      expect(subject).not_to permit(owner, completed_appointment)
      expect(subject).not_to permit(veterinarian, completed_appointment)
      expect(subject).not_to permit(admin, completed_appointment)
    end
  end

  permissions :destroy? do
    it 'allows owner to cancel their pet appointment' do
      expect(subject).to permit(owner, appointment)
    end

    it 'denies owner from cancelling other pet appointments' do
      expect(subject).not_to permit(owner, other_appointment)
    end

    it 'allows admin to cancel any appointment' do
      expect(subject).to permit(admin, appointment)
    end

    it 'denies cancelling completed appointments' do
      expect(subject).not_to permit(owner, completed_appointment)
      expect(subject).not_to permit(admin, completed_appointment)
    end
  end

  permissions :complete? do
    it 'allows veterinarian to complete appointment' do
      expect(subject).to permit(veterinarian, appointment)
    end

    it 'allows admin to complete appointment' do
      expect(subject).to permit(admin, appointment)
    end

    it 'denies owner from completing appointment' do
      expect(subject).not_to permit(owner, appointment)
    end

    it 'denies completing already completed appointment' do
      expect(subject).not_to permit(veterinarian, completed_appointment)
    end
  end

  permissions :cancel? do
    it 'allows owner to cancel their appointment' do
      expect(subject).to permit(owner, appointment)
    end

    it 'allows admin to cancel appointment' do
      expect(subject).to permit(admin, appointment)
    end

    it 'denies cancelling completed appointment' do
      expect(subject).not_to permit(owner, completed_appointment)
    end
  end
end
