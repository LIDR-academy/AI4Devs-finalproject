# frozen_string_literal: true

class VaccinationsController < ApplicationController
  before_action :set_vaccination, only: [:show, :edit, :update, :destroy, :certificate]
  before_action :set_pet, only: [:new, :create, :index], if: -> { params[:pet_id].present? }
  
  # GET /vaccinations or /pets/:pet_id/vaccinations
  def index
    if @pet
      @vaccinations = policy_scope(Vaccination)
                      .for_pet(@pet.id)
                      .includes(:veterinarian, :medical_record)
                      .order(administered_at: :desc)
    else
      @vaccinations = policy_scope(Vaccination)
                      .includes(:pet, :veterinarian, :medical_record, pet: :user)
                      .order(administered_at: :desc)
    end
    
    # Filter by vaccine type if provided
    @vaccinations = @vaccinations.for_vaccine_type(params[:vaccine_type]) if params[:vaccine_type].present?
    
    # Filter by status
    case params[:filter]
    when 'upcoming'
      @vaccinations = @vaccinations.upcoming
    when 'overdue'
      @vaccinations = @vaccinations.overdue
    when 'due_soon'
      @vaccinations = @vaccinations.due_soon
    end
  end

  # GET /vaccinations/:id
  def show
    authorize @vaccination
  end

  # GET /vaccinations/new or /pets/:pet_id/vaccinations/new
  def new
    @vaccination = Vaccination.new
    @vaccination.pet = @pet if @pet
    @vaccination.veterinarian = current_user if current_user.veterinarian? || current_user.admin?
    @vaccination.administered_at = Date.today
    @vaccination.dose_number = calculate_next_dose_number if @pet
    
    authorize @vaccination
    
    @pets = policy_scope(Pet).active
    @veterinarians = User.veterinarians
    @medical_records = @pet ? @pet.medical_records.recent.limit(10) : []
  end

  # GET /vaccinations/:id/edit
  def edit
    authorize @vaccination
    @pets = policy_scope(Pet).active
    @veterinarians = User.veterinarians
    @medical_records = @vaccination.pet.medical_records.recent.limit(10)
  end

  # POST /vaccinations
  def create
    @vaccination = Vaccination.new(vaccination_params)
    authorize @vaccination

    if @vaccination.save
      redirect_to @vaccination, notice: 'Vacunación registrada exitosamente.'
    else
      @pets = policy_scope(Pet).active
      @veterinarians = User.veterinarians
      @medical_records = @vaccination.pet ? @vaccination.pet.medical_records.recent.limit(10) : []
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /vaccinations/:id
  def update
    authorize @vaccination

    if @vaccination.update(vaccination_params)
      redirect_to @vaccination, notice: 'Vacunación actualizada exitosamente.'
    else
      @pets = policy_scope(Pet).active
      @veterinarians = User.veterinarians
      @medical_records = @vaccination.pet.medical_records.recent.limit(10)
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /vaccinations/:id
  def destroy
    authorize @vaccination
    pet = @vaccination.pet
    @vaccination.destroy
    
    redirect_to pet ? pet_vaccinations_path(pet) : vaccinations_path, 
                notice: 'Vacunación eliminada exitosamente.'
  end

  # GET /vaccinations/:id/certificate
  def certificate
    authorize @vaccination, :show?
    # Generate PDF certificate (placeholder - implement PDF generation)
    respond_to do |format|
      format.html { render :certificate, layout: 'certificate' }
      format.pdf do
        # TODO: Implement PDF generation with prawn or wicked_pdf
        redirect_to vaccination_path(@vaccination), notice: 'Generación de PDF pendiente de implementación'
      end
    end
  end

  private

  def set_vaccination
    @vaccination = Vaccination.find(params[:id])
  end

  def set_pet
    if params[:pet_id].present?
      begin
        @pet = Pet.find(params[:pet_id])
        authorize @pet, :show? if @pet
      rescue ActiveRecord::RecordNotFound
        @pet = nil
      end
    end
  end

  def calculate_next_dose_number
    return 1 unless @pet
    
    scheduler = VaccinationScheduler.new(@pet, params[:vaccine_type] || 'other')
    scheduler.next_dose_number
  end

  def vaccination_params
    params.require(:vaccination).permit(
      :pet_id,
      :veterinarian_id,
      :medical_record_id,
      :vaccine_name,
      :vaccine_type,
      :manufacturer,
      :lot_number,
      :administered_at,
      :expires_at,
      :next_due_date,
      :dose_number,
      :notes
    )
  end
end
