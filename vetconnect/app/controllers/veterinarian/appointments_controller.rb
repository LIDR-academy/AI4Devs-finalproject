# frozen_string_literal: true

module Veterinarian
  class AppointmentsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_veterinarian!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      appointments = Appointment.for_veterinarian(current_user.id)
                               .includes(:pet, :clinic, pet: :user)
      
      # Filter by status if provided
      if params[:status].present?
        appointments = appointments.where(status: params[:status])
      end
      
      @appointments = appointments.order(appointment_date: :desc)
                                  .page(params[:page])
    end

    def show
      @appointment = Appointment.for_veterinarian(current_user.id)
                                .includes(:pet, :clinic, :veterinarian, pet: :user)
                                .find(params[:id])
    end

    private

    def ensure_veterinarian!
      unless current_user.veterinarian? || current_user.admin?
        redirect_to root_path, alert: 'Access denied'
      end
    end
  end
end
