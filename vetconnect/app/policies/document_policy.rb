# frozen_string_literal: true

# Policy for Document resource
# Defines who can perform actions on documents
class DocumentPolicy < ApplicationPolicy
  # Scope class to filter documents based on user role
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        # Admins and vets can see all documents
        scope.all
      elsif user.owner?
        # Owners can only see documents for their pets
        scope.joins(:pet).where(pets: { user_id: user.id })
      else
        scope.none
      end
    end
  end

  # All authenticated users can view document index
  def index?
    true
  end

  # Users can view documents they're involved in
  def show?
    user.admin? || 
    user.veterinarian? || 
    record.pet.user_id == user.id
  end

  # Vets and admins can upload medical documents
  # Owners can upload general documents for their pets
  def create?
    if user.veterinarian? || user.admin?
      true
    elsif user.owner?
      # Owners can only upload documents to their own pets
      true
    else
      false
    end
  end

  # Only uploader or admin can update document metadata
  def update?
    user.admin? || record.uploaded_by_id == user.id
  end

  # Only uploader or admin can delete documents
  def destroy?
    user.admin? || record.uploaded_by_id == user.id
  end

  # Permission to download
  def download?
    show?
  end

  # Permission to share (future feature)
  def share?
    user.admin? || user.veterinarian? || record.pet.user_id == user.id
  end
end
