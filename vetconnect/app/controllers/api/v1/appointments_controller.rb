# frozen_string_literal: true

module Api
  module V1
    # API controller for Appointments
    class AppointmentsController < Api::BaseController
      before_action :set_appointment, only: [:show, :update]
      
      # GET /api/v1/appointments
      def index
        @appointments = policy_scope(Appointment)
                          .includes(:pet, :veterinarian, :clinic, pet: :user)
                          .order(appointment_date: :desc)
                          .page(params[:page] || 1)
                          .per(params[:per_page] || 20)
        
        # Filter by status if provided
        @appointments = @appointments.where(status: params[:status]) if params[:status].present?
        
        # Filter by pet_id if provided
        @appointments = @appointments.where(pet_id: params[:pet_id]) if params[:pet_id].present?
        
        # Filter by veterinarian_id if provided
        @appointments = @appointments.where(veterinarian_id: params[:veterinarian_id]) if params[:veterinarian_id].present?
        
        render :index
      end
      
      # GET /api/v1/appointments/:id
      def show
        authorize @appointment
        render :show
      end
      
      # POST /api/v1/appointments
      def create
        @appointment = Appointment.new(appointment_params)
        authorize @appointment
        
        if @appointment.save
          # Send confirmation email
          AppointmentMailer.confirmation(@appointment).deliver_later
          render :show, status: :created, location: api_v1_appointment_path(@appointment)
        else
          render json: {
            error: 'Failed to create appointment',
            errors: @appointment.errors.full_messages
          }, status: :unprocessable_entity
        end
      end
      
      # PATCH/PUT /api/v1/appointments/:id
      def update
        authorize @appointment
        
        if @appointment.update(appointment_params)
          render :show
        else
          render json: {
            error: 'Failed to update appointment',
            errors: @appointment.errors.full_messages
          }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_appointment
        @appointment = Appointment.includes(:pet, :veterinarian, :clinic, pet: :user)
                                  .find(params[:id])
      end
      
      def appointment_params
        params.require(:appointment).permit(
          :pet_id,
          :veterinarian_id,
          :clinic_id,
          :appointment_date,
          :duration_minutes,
          :appointment_type,
          :reason,
          :notes,
          :status
        )
      end
    end
  end
end
