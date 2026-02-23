# frozen_string_literal: true

# Policy for MedicalRecord resource
# Defines who can perform actions on medical records
class MedicalRecordPolicy < ApplicationPolicy
  # Scope class to filter medical records based on user role
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        # Admins and vets can see all medical records
        scope.all
      elsif user.owner?
        # Owners can only see medical records for their pets
        scope.joins(:pet).where(pets: { user_id: user.id })
      else
        scope.none
      end
    end
  end

  # All authenticated users can view medical record index
  def index?
    true
  end

  # Users can view medical records they're involved in
  def show?
    user.admin? || 
    user.veterinarian? || 
    record.pet.user_id == user.id
  end

  # Only vets and admins can create medical records
  def create?
    user.veterinarian? || user.admin?
  end

  # Only vets and admins can update medical records
  def update?
    user.veterinarian? || user.admin?
  end

  # Medical records should never be deleted (audit trail)
  # This is a critical business rule for veterinary clinics
  def destroy?
    false
  end

  # Permission to add notes
  def add_notes?
    update?
  end

  # Permission to attach documents
  def attach_documents?
    update?
  end

  # Permission to view full details (including sensitive information)
  def view_full_details?
    show?
  end
end
