# frozen_string_literal: true

# Base policy class that all other policies inherit from
# Provides default implementations for standard CRUD actions
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  # Default: Only admins can view index
  def index?
    user&.admin?
  end

  # Default: Only admins can view show
  def show?
    user&.admin?
  end

  # Default: Only admins can create
  def create?
    user&.admin?
  end

  # Default: Only admins can access new
  def new?
    create?
  end

  # Default: Only admins can update
  def update?
    user&.admin?
  end

  # Default: Only admins can access edit
  def edit?
    update?
  end

  # Default: Only admins can destroy
  def destroy?
    user&.admin?
  end

  # Scope class for filtering collections based on user permissions
  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    # Default: Admins see all, others see none
    def resolve
      if user&.admin?
        scope.all
      else
        scope.none
      end
    end

    private

    attr_reader :user, :scope
  end
end
