# frozen_string_literal: true

# Policy for Pet resource
# Defines who can perform actions on pets
class PetPolicy < ApplicationPolicy
  # Scope class to filter pets based on user role
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        # Admins and vets can see all pets in the clinic
        scope.all
      elsif user.owner?
        # Owners can only see their own pets
        scope.where(user_id: user.id)
      else
        scope.none
      end
    end
  end

  # All authenticated users can view pet index
  def index?
    true
  end

  # Owners can view their own pets, vets and admins can view all pets
  def show?
    user.admin? || user.veterinarian? || record.user_id == user.id
  end

  # Only owners can create pets (for themselves)
  def create?
    user.owner?
  end

  # Owners can only update their own pets
  def update?
    user.owner? && record.user_id == user.id
  end

  # Owners can only delete their own pets
  def destroy?
    user.owner? && record.user_id == user.id
  end

  # Permission to view medical history
  def view_medical_history?
    show?
  end

  # Permission to view documents
  def view_documents?
    show?
  end
end
