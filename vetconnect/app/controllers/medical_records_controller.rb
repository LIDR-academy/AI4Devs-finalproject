# frozen_string_literal: true

class MedicalRecordsController < ApplicationController
  before_action :set_medical_record, only: [:show, :edit, :update]
  before_action :set_pet, only: [:new, :create]

  # GET /medical_records
  def index
    @medical_records = policy_scope(MedicalRecord)
                        .includes(:pet, :veterinarian)
                        .order(visit_date: :desc)
    
    # Filter by pet if provided
    if params[:pet_id].present?
      @pet = Pet.find(params[:pet_id])
      authorize @pet, :show?
      @medical_records = @medical_records.where(pet_id: @pet.id)
    end
  end

  # GET /medical_records/:id
  def show
    authorize @medical_record
    @documents = @medical_record.documents
  end

  # GET /medical_records/new
  def new
    @medical_record = @pet.medical_records.build(veterinarian: current_user)
    authorize @medical_record
  end

  # GET /medical_records/:id/edit
  def edit
    authorize @medical_record
  end

  # POST /medical_records
  def create
    @medical_record = @pet.medical_records.build(medical_record_params)
    @medical_record.veterinarian = current_user
    authorize @medical_record

    if @medical_record.save
      redirect_to @medical_record, notice: 'Registro médico creado exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /medical_records/:id
  def update
    authorize @medical_record

    if @medical_record.update(medical_record_params)
      redirect_to @medical_record, notice: 'Registro médico actualizado exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # Note: No destroy action - medical records should never be deleted

  private

  def set_medical_record
    @medical_record = MedicalRecord.find(params[:id])
  end

  def set_pet
    @pet = Pet.find(params[:pet_id])
  end

  def medical_record_params
    params.require(:medical_record).permit(
      :visit_date, :record_type, :diagnosis, :treatment,
      :prescription, :notes, :weight, :temperature, :appointment_id
    )
  end
end
