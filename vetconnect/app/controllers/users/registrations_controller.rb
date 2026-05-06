# frozen_string_literal: true

# Registration controller disabled - users are created by admin only
# This controller is kept for reference but routes are disabled in routes.rb
class Users::RegistrationsController < Devise::RegistrationsController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped
  
  # All registration actions are disabled
  def new
    redirect_to root_path, alert: 'El registro de usuarios está deshabilitado. Contacta al administrador para crear una cuenta.'
  end

  def create
    redirect_to root_path, alert: 'El registro de usuarios está deshabilitado. Contacta al administrador para crear una cuenta.'
  end

  protected

  def configure_sign_up_params
    # Not used - registration disabled
  end

  def configure_account_update_params
    # Not used - registration disabled
  end
end
