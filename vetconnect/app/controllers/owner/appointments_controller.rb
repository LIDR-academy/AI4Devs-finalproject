# frozen_string_literal: true

module Owner
  class AppointmentsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_owner!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      appointments = Appointment.joins(:pet)
                                .where(pets: { user_id: current_user.id })
                                .includes(:pet, :veterinarian, :clinic)
      
      # Filter by status if provided
      if params[:status].present?
        appointments = appointments.where(status: params[:status])
      end
      
      # Separate upcoming and past appointments
      @upcoming_appointments = appointments.where('appointment_date >= ?', Time.current)
                                          .order(appointment_date: :asc)
      @past_appointments = appointments.where('appointment_date < ?', Time.current)
                                     .order(appointment_date: :desc)
      
      # For backward compatibility
      @appointments = appointments.order(appointment_date: :desc)
    end

    def show
      @appointment = Appointment.joins(:pet)
                                 .where(pets: { user_id: current_user.id })
                                 .find(params[:id])
    end

    private

    def ensure_owner!
      redirect_to root_path, alert: 'Access denied' unless current_user.owner?
    end
  end
end
