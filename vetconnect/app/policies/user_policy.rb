# frozen_string_literal: true

# Policy for User resource
# Defines who can perform actions on users (admin functionality)
class UserPolicy < ApplicationPolicy
  # Scope class to filter users based on role
  class Scope < Scope
    def resolve
      if user.admin?
        # Admins can see all users
        scope.all
      elsif user.veterinarian?
        # Vets can see other vets and pet owners they've interacted with
        owner_ids = Appointment.where(veterinarian_id: user.id)
                               .joins(:pet)
                               .pluck('pets.user_id')
                               .uniq
        
        scope.where(id: owner_ids).or(scope.where(role: [:veterinarian, :admin]))
      elsif user.owner?
        # Owners can only see themselves and vets/admins they've interacted with
        vet_ids = Appointment.joins(:pet)
                            .where(pets: { user_id: user.id })
                            .pluck(:veterinarian_id)
                            .uniq
        
        scope.where(id: [user.id] + vet_ids)
      else
        scope.none
      end
    end
  end

  # All authenticated users can view user index (scoped)
  def index?
    true
  end

  # Users can view their own profile
  # Admins can view all profiles
  # Vets can view profiles of their patients' owners
  def show?
    return true if user.admin?
    return true if record.id == user.id
    
    if user.veterinarian?
      # Check if this vet has appointments with this owner's pets
      owner_ids = Appointment.where(veterinarian_id: user.id)
                            .joins(:pet)
                            .pluck('pets.user_id')
                            .uniq
      owner_ids.include?(record.id)
    else
      false
    end
  end

  # Only admins can create users (staff management)
  def create?
    user.admin?
  end

  # Users can update their own profile
  # Admins can update any profile
  def update?
    user.admin? || record.id == user.id
  end

  # Only admins can delete users
  def destroy?
    user.admin? && record.id != user.id # Can't delete yourself
  end

  # Permission to change role (admin only)
  def change_role?
    user.admin? && record.id != user.id
  end

  # Permission to view activity logs
  def view_activity?
    user.admin? || record.id == user.id
  end

  # Permission to manage clinic settings (admin only)
  def manage_clinic?
    user.admin?
  end

  # Permission to view reports and analytics (admin only)
  def view_reports?
    user.admin?
  end

  # Permission to send messages
  def send_message?
    return false unless user && record
    
    if user.admin?
      true
    elsif user.veterinarian?
      # Vets can message pet owners
      record.owner?
    elsif user.owner?
      # Owners can message vets and admins
      record.veterinarian? || record.admin?
    else
      false
    end
  end
end
