# frozen_string_literal: true

# Policy for Vaccination resource
# Defines who can perform actions on vaccinations
class VaccinationPolicy < ApplicationPolicy
  # Scope class to filter vaccinations based on user role
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        # Admins and vets can see all vaccinations
        scope.all
      elsif user.owner?
        # Owners can only see vaccinations for their pets
        scope.joins(:pet).where(pets: { user_id: user.id })
      else
        scope.none
      end
    end
  end

  # All authenticated users can view vaccination index
  def index?
    true
  end

  # Users can view vaccinations they're involved in
  def show?
    user.admin? || 
    user.veterinarian? || 
    record.pet.user_id == user.id
  end

  # Only veterinarians and admins can create vaccinations
  def create?
    user.veterinarian? || user.admin?
  end

  # Can update if user has permission
  def update?
    if user.admin?
      true
    elsif user.veterinarian?
      # Vets can update vaccinations they created or are assigned to
      record.veterinarian_id == user.id
    else
      false
    end
  end

  # Only veterinarians and admins can delete vaccinations
  def destroy?
    user.veterinarian? || user.admin?
  end
end
