# frozen_string_literal: true

module Veterinarian
  class DashboardController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_veterinarian!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @today_appointments = Appointment.for_veterinarian(current_user.id)
                                      .today
                                      .includes(:pet, :clinic)
                                      .order(:appointment_date)
      
      @upcoming_appointments = Appointment.for_veterinarian(current_user.id)
                                         .upcoming
                                         .where('appointment_date > ?', Date.tomorrow)
                                         .limit(10)
    end

    private

    def ensure_veterinarian!
      unless current_user.veterinarian? || current_user.admin?
        redirect_to root_path, alert: 'Access denied'
      end
    end
  end
end
