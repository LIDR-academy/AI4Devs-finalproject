# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Authentication
  before_action :authenticate_user!, unless: :devise_controller?
  before_action :configure_permitted_parameters, if: :devise_controller?

  # Authorization
  after_action :verify_authorized, except: :index, unless: :skip_pundit?
  after_action :verify_policy_scoped, only: :index, unless: :skip_pundit?

  # Handle authorization errors
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name, :phone, :role])
    devise_parameter_sanitizer.permit(:account_update, keys: [:first_name, :last_name, :phone])
  end

  # Redirect user after sign in based on their role
  def after_sign_in_path_for(resource)
    case resource.role
    when 'owner'
      owner_root_path
    when 'veterinarian'
      veterinarian_root_path
    when 'admin'
      admin_root_path
    else
      root_path
    end
  end

  # Redirect user after sign out
  def after_sign_out_path_for(resource_or_scope)
    root_path
  end

  private

  # Handle authorization failure
  def user_not_authorized
    flash[:alert] = "No estás autorizado para realizar esta acción."
    redirect_to(request.referer || root_path)
  end

  # Skip Pundit verification for certain controllers/actions
  def skip_pundit?
    devise_controller? || controller_name == 'home'
  end
end
