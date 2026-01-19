# frozen_string_literal: true

class MedicalRecordsController < ApplicationController
  before_action :set_medical_record, only: [:show, :edit, :update]
  before_action :set_pet, only: [:create], if: -> { params[:pet_id].present? }

  # GET /medical_records
  def index
    @medical_records = policy_scope(MedicalRecord)
                        .includes(:pet, :veterinarian, pet: :user)
                        .order(visit_date: :desc)
    
    # Filter by pet if provided
    if params[:pet_id].present?
      @pet = Pet.includes(:user).find(params[:pet_id])
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
    if params[:pet_id].present?
      @pet = Pet.includes(:user).find(params[:pet_id])
      authorize @pet, :show?
      @medical_record = @pet.medical_records.build(veterinarian: current_user)
    else
      @medical_record = MedicalRecord.new(veterinarian: current_user)
      @pets = policy_scope(Pet).active
    end
    authorize @medical_record
  end

  # GET /medical_records/:id/edit
  def edit
    authorize @medical_record
  end

  # POST /medical_records
  def create
    if params[:pet_id].present?
      @pet = Pet.includes(:user).find(params[:pet_id])
      authorize @pet, :show?
      @medical_record = @pet.medical_records.build(medical_record_params)
    else
      @medical_record = MedicalRecord.new(medical_record_params)
      @pet = @medical_record.pet
    end
    @medical_record.veterinarian = current_user unless @medical_record.veterinarian.present?
    authorize @medical_record

    if @medical_record.save
      redirect_to @medical_record, notice: 'Registro médico creado exitosamente.'
    else
      @pets = policy_scope(Pet).active unless @pet.present?
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
    @medical_record = MedicalRecord.includes(:pet, :veterinarian, :documents).find(params[:id])
  end

  def set_pet
    @pet = Pet.includes(:user).find(params[:pet_id])
  end

  def medical_record_params
    params.require(:medical_record).permit(
      :visit_date, :record_type, :diagnosis, :treatment,
      :prescription, :notes, :weight, :temperature, :appointment_id
    )
  end
end
