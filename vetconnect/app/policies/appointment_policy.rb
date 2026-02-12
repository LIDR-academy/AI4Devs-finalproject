# frozen_string_literal: true

# Policy for Appointment resource
# Defines who can perform actions on appointments
class AppointmentPolicy < ApplicationPolicy
  # Scope class to filter appointments based on user role
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        # Admins and vets can see all appointments
        scope.all
      elsif user.owner?
        # Owners can only see appointments for their pets
        scope.joins(:pet).where(pets: { user_id: user.id })
      else
        scope.none
      end
    end
  end

  # All authenticated users can view appointment index
  def index?
    true
  end

  # Users can view appointments they're involved in
  def show?
    user.admin? || 
    user.veterinarian? || 
    record.pet.user_id == user.id
  end

  # Owners, vets, and admins can create appointments
  def create?
    user.owner? || user.veterinarian? || user.admin?
  end

  # Can update if not completed and user has permission
  def update?
    return false if record.completed? || record.status_cancelled?
    
    if user.admin?
      true
    elsif user.veterinarian?
      # Vets can update appointments assigned to them
      true
    elsif user.owner?
      # Owners can update their own pet's appointments
      record.pet.user_id == user.id
    else
      false
    end
  end

  # Can cancel if not completed
  def destroy?
    return false if record.completed?
    
    if user.admin?
      true
    elsif user.owner?
      # Owners can cancel their own appointments
      record.pet.user_id == user.id
    else
      false
    end
  end

  # Permission to mark as completed (only vets and admins)
  def complete?
    (user.veterinarian? || user.admin?) && !record.completed?
  end

  # Permission to cancel
  def cancel?
    destroy?
  end

  # Permission to reschedule
  def reschedule?
    update?
  end
end
