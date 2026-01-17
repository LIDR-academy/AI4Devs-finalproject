# frozen_string_literal: true

class AppointmentsController < ApplicationController
  before_action :set_appointment, only: [:show, :edit, :update, :destroy, :complete, :cancel, :confirm, :mark_no_show]
  
  # API endpoint doesn't require authentication
  skip_before_action :authenticate_user!, only: [:available_slots]
  skip_after_action :verify_authorized, only: [:available_slots]

  # GET /appointments
  def index
    @appointments = policy_scope(Appointment)
                      .includes(:pet, :veterinarian, :clinic)
                      .order(appointment_date: :desc)
    
    # Filter by status if provided
    @appointments = @appointments.where(status: params[:status]) if params[:status].present?
  end

  # GET /appointments/:id
  def show
    authorize @appointment
  end

  # GET /appointments/new
  def new
    @appointment = Appointment.new
    @appointment.pet_id = params[:pet_id] if params[:pet_id].present?
    authorize @appointment
    
    @pets = policy_scope(Pet)
    @veterinarians = User.veterinarians
    @clinics = Clinic.active
  end

  # GET /appointments/:id/edit
  def edit
    authorize @appointment
    @pets = policy_scope(Pet)
    @veterinarians = User.veterinarians
    @clinics = Clinic.active
  end

  # POST /appointments
  def create
    @appointment = Appointment.new(appointment_params)
    authorize @appointment

    if @appointment.save
      # Send confirmation email
      AppointmentMailer.confirmation(@appointment).deliver_later
      
      redirect_to @appointment, notice: 'Cita creada exitosamente.'
    else
      @pets = policy_scope(Pet)
      @veterinarians = User.veterinarians
      @clinics = Clinic.active
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /appointments/:id
  def update
    authorize @appointment

    if @appointment.update(appointment_params)
      redirect_to @appointment, notice: 'Cita actualizada exitosamente.'
    else
      @pets = policy_scope(Pet)
      @veterinarians = User.veterinarians
      @clinics = Clinic.active
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /appointments/:id
  def destroy
    authorize @appointment
    
    if @appointment.cancel!(params[:cancellation_reason])
      # Send cancellation email
      AppointmentMailer.cancellation(@appointment).deliver_later
      
      redirect_to appointments_url, notice: 'Cita cancelada exitosamente.'
    else
      redirect_to @appointment, alert: 'No se pudo cancelar la cita.'
    end
  end

  # POST /appointments/:id/complete
  def complete
    authorize @appointment, :complete?
    
    if @appointment.complete!
      # Redirect to medical record creation
      redirect_to new_appointment_medical_record_path(@appointment), 
                  notice: 'Cita completada. Por favor, registra la consulta.'
    else
      redirect_to @appointment, alert: 'No se pudo completar la cita.'
    end
  end

  # POST /appointments/:id/cancel
  def cancel
    authorize @appointment, :cancel?
    
    if @appointment.cancel!(params[:cancellation_reason])
      # Send cancellation email
      AppointmentMailer.cancellation(@appointment).deliver_later
      
      redirect_to @appointment, notice: 'Cita cancelada exitosamente.'
    else
      redirect_to @appointment, alert: 'No se pudo cancelar la cita.'
    end
  end

  # POST /appointments/:id/confirm
  def confirm
    authorize @appointment
    
    if @appointment.confirm!
      redirect_to @appointment, notice: 'Cita confirmada exitosamente.'
    else
      redirect_to @appointment, alert: 'No se pudo confirmar la cita.'
    end
  end

  # POST /appointments/:id/mark_no_show
  def mark_no_show
    authorize @appointment, :complete?
    
    if @appointment.mark_no_show!
      redirect_to @appointment, notice: 'Cita marcada como no asistió.'
    else
      redirect_to @appointment, alert: 'No se pudo marcar la cita.'
    end
  end

  # GET /appointments/available_slots
  def available_slots
    begin
      veterinarian_id = params[:veterinarian_id]
      date = Date.parse(params[:date])
      clinic_id = params[:clinic_id]
      
      slots = Appointment.available_slots(veterinarian_id, date, clinic_id)
      
      render json: { slots: slots }
    rescue ArgumentError => e
      render json: { error: 'Invalid date format' }, status: :bad_request
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: 'Clinic not found' }, status: :not_found
    rescue => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  private

  def set_appointment
    @appointment = Appointment.find(params[:id])
  end

  def appointment_params
    params.require(:appointment).permit(
      :pet_id, :veterinarian_id, :clinic_id, :appointment_date, :duration_minutes,
      :appointment_type, :reason, :notes, :status, :cancellation_reason
    )
  end
end
