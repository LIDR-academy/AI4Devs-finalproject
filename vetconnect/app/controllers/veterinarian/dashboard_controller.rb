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
                                      .includes(:pet, :clinic, pet: :user)
                                      .order(:appointment_date)
      
      @upcoming_appointments = Appointment.for_veterinarian(current_user.id)
                                         .upcoming
                                         .where('appointment_date > ?', Date.tomorrow)
                                         .includes(:pet, :clinic, pet: :user)
                                         .limit(10)
      
      # Pending appointments (scheduled or confirmed)
      @pending_appointments = Appointment.for_veterinarian(current_user.id)
                                        .where(status: [:scheduled, :confirmed])
                                        .upcoming
      
      # Completed this week
      @week_completed = Appointment.for_veterinarian(current_user.id)
                                  .where(status: :completed)
                                  .this_week
      
      # Total unique patients
      @total_patients = Appointment.for_veterinarian(current_user.id)
                                  .joins(:pet)
                                  .select('DISTINCT pets.id')
                                  .count
    end

    private

    def ensure_veterinarian!
      unless current_user.veterinarian? || current_user.admin?
        redirect_to root_path, alert: 'Access denied'
      end
    end
  end
end
