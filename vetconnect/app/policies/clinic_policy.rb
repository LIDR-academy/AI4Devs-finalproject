# frozen_string_literal: true

class ClinicPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # All users can see active clinics
      scope.active
    end
  end

  def index?
    true # All authenticated users can view clinics
  end

  def show?
    true # All authenticated users can view clinic details
  end

  def create?
    user.admin?
  end

  def update?
    user.admin?
  end

  def destroy?
    user.admin?
  end

  def new?
    create?
  end

  def edit?
    update?
  end
end
