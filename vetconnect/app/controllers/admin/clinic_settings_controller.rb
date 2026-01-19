# frozen_string_literal: true

module Admin
  class ClinicSettingsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_admin!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def show
      @clinics = Clinic.all.includes(:appointments).order(:name)
    end

    def edit
      # Redirect to clinic edit page
      @clinic = Clinic.find(params[:id])
      redirect_to edit_clinic_path(@clinic)
    end

    def update
      @clinic = Clinic.find(params[:id])
      
      if @clinic.update(clinic_params)
        redirect_to admin_clinic_settings_path, notice: 'Configuración de clínica actualizada exitosamente.'
      else
        redirect_to edit_clinic_path(@clinic), alert: 'No se pudo actualizar la clínica.'
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
