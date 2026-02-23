# frozen_string_literal: true

module Owner
  class PetsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_owner!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @pets = current_user.pets.active.order(created_at: :desc)
    end

    def show
      @pet = current_user.pets.find(params[:id])
      @appointments = @pet.appointments.order(appointment_date: :desc).limit(10)
      @medical_records = @pet.medical_records.order(visit_date: :desc).limit(10)
    end

    private

    def ensure_owner!
      redirect_to root_path, alert: 'Access denied' unless current_user.owner?
    end
  end
end
