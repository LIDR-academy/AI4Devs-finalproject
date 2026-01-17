# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  # Track successful sign-in
  def after_sign_in_path_for(resource)
    Rails.logger.info "User #{resource.email} (#{resource.role}) signed in successfully"
    super
  end
end
