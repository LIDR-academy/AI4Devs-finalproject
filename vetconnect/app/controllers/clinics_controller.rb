# frozen_string_literal: true

class ClinicsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_clinic, only: [:show, :edit, :update, :destroy]

  def index
    @clinics = policy_scope(Clinic).order(:name)
  end

  def show
    authorize @clinic
  end

  def new
    @clinic = Clinic.new
    authorize @clinic
  end

  def create
    @clinic = Clinic.new(clinic_params)
    authorize @clinic

    if @clinic.save
      redirect_to @clinic, notice: 'Clínica creada exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @clinic
  end

  def update
    authorize @clinic

    if @clinic.update(clinic_params)
      redirect_to @clinic, notice: 'Clínica actualizada exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @clinic
    
    if @clinic.destroy
      redirect_to clinics_path, notice: 'Clínica eliminada exitosamente.'
    else
      redirect_to @clinic, alert: 'No se pudo eliminar la clínica.'
    end
  end

  private

  def set_clinic
    @clinic = Clinic.find(params[:id])
  end

  def clinic_params
    params.require(:clinic).permit(
      :name, :address, :phone, :email, :active, :operating_hours
    )
  end
end
