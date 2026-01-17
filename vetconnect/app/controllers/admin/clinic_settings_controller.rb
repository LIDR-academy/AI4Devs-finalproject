# frozen_string_literal: true

module Admin
  class ClinicSettingsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_admin!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def show
      @clinics = Clinic.all
    end

    def edit
      @clinic = Clinic.find(params[:id]) if params[:id]
    end

    def update
      @clinic = Clinic.find(params[:id])
      
      if @clinic.update(clinic_params)
        redirect_to admin_clinic_settings_path, notice: 'Clinic settings updated successfully.'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def ensure_admin!
      redirect_to root_path, alert: 'Access denied' unless current_user.admin?
    end

    def clinic_params
      params.require(:clinic).permit(
        :name, :address, :phone, :email, :active, :operating_hours
      )
    end
  end
end
