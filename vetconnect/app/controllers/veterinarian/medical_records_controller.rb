# frozen_string_literal: true

module Veterinarian
  class MedicalRecordsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_veterinarian!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @medical_records = MedicalRecord.where(veterinarian_id: current_user.id)
                                      .includes(:pet)
                                      .order(visit_date: :desc)
                                      .page(params[:page])
    end

    def show
      @medical_record = MedicalRecord.where(veterinarian_id: current_user.id)
                                    .find(params[:id])
    end

    def new
      @medical_record = MedicalRecord.new
      @pets = Pet.all # In a real app, filter by clinic or accessible pets
    end

    def create
      @medical_record = MedicalRecord.new(medical_record_params)
      @medical_record.veterinarian = current_user

      if @medical_record.save
        redirect_to veterinarian_medical_record_path(@medical_record), 
                    notice: 'Medical record created successfully.'
      else
        @pets = Pet.all
        render :new, status: :unprocessable_entity
      end
    end

    private

    def ensure_veterinarian!
      unless current_user.veterinarian? || current_user.admin?
        redirect_to root_path, alert: 'Access denied'
      end
    end

    def medical_record_params
      params.require(:medical_record).permit(
        :pet_id, :appointment_id, :visit_date, :record_type,
        :diagnosis, :treatment, :prescription, :notes,
        :weight, :temperature
      )
    end
  end
end
