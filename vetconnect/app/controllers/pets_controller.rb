# frozen_string_literal: true

class PetsController < ApplicationController
  before_action :set_pet, only: [:show, :edit, :update, :destroy]

  # GET /pets
  def index
    @pets = policy_scope(Pet).active.includes(:user).page(params[:page]).per(15)
  end

  # GET /pets/:id
  def show
    authorize @pet
    @recent_appointments = @pet.recent_appointments
    @next_vaccination = @pet.next_vaccination_due
    @medical_records = @pet.medical_records.order(visit_date: :desc).limit(5)
  end

  # GET /pets/new
  def new
    @pet = current_user.pets.build
    authorize @pet
  end

  # GET /pets/:id/edit
  def edit
    authorize @pet
  end

  # POST /pets
  def create
    @pet = current_user.pets.build(pet_params)
    authorize @pet

    if @pet.save
      redirect_to @pet, notice: 'Mascota registrada exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /pets/:id
  def update
    authorize @pet

    if @pet.update(pet_params)
      redirect_to @pet, notice: 'Mascota actualizada exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /pets/:id (soft delete - deactivate)
  def destroy
    authorize @pet

    if @pet.deactivate!
      redirect_to pets_path, notice: 'Mascota desactivada exitosamente.'
    else
      redirect_to @pet, alert: 'No se pudo desactivar la mascota.'
    end
  end

  private

  def set_pet
    @pet = Pet.find(params[:id])
  end

  def pet_params
    params.require(:pet).permit(
      :name, :species, :breed, :birth_date, :gender, 
      :color, :weight, :microchip_number, :special_notes, :photo
    )
  end
end
