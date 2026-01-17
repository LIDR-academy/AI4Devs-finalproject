# frozen_string_literal: true

module Admin
  class DashboardController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_admin!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @stats = {
        total_users: User.count,
        total_pets: Pet.count,
        total_appointments: Appointment.count,
        upcoming_appointments: Appointment.upcoming.count,
        total_medical_records: MedicalRecord.count
      }
      
      @recent_appointments = Appointment.includes(:pet, :veterinarian, :clinic)
                                       .order(created_at: :desc)
                                       .limit(10)
    end

    private

    def ensure_admin!
      redirect_to root_path, alert: 'Access denied' unless current_user.admin?
    end
  end
end
