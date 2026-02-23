# frozen_string_literal: true

module Owner
  class DashboardController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_owner!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @pets = current_user.pets.active.includes(:appointments)
      @upcoming_appointments = Appointment.joins(:pet)
                                         .where(pets: { user_id: current_user.id })
                                         .upcoming
                                         .includes(:pet, :veterinarian, :clinic)
                                         .limit(5)
    end

    private

    def ensure_owner!
      redirect_to root_path, alert: 'Access denied' unless current_user.owner?
    end
  end
end
