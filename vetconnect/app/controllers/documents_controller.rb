# frozen_string_literal: true

class DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :edit, :update, :destroy, :download, :share]
  before_action :set_pet, only: [:new, :create], if: -> { params[:pet_id].present? }

  # GET /documents
  def index
    @documents = policy_scope(Document)
                  .includes(:pet, :uploaded_by, pet: :user)
                  .order(created_at: :desc)
    
    # Filter by pet if provided
    if params[:pet_id].present?
      @pet = Pet.includes(:user).find(params[:pet_id])
      authorize @pet, :show?
      @documents = @documents.where(pet_id: @pet.id)
    end
  end

  # GET /documents/:id
  def show
    authorize @document
  end

  # GET /documents/new
  def new
    if @pet
      @document = @pet.documents.build(uploaded_by: current_user)
    else
      @document = Document.new(uploaded_by: current_user)
      @pets = policy_scope(Pet).active
      # Set @pet from document if pet_id is provided in params
      if params[:document] && params[:document][:pet_id].present?
        @pet = Pet.find_by(id: params[:document][:pet_id])
      end
    end
    authorize @document
  end

  # GET /documents/:id/edit
  def edit
    authorize @document
  end

  # POST /documents
  def create
    if @pet
      @document = @pet.documents.build(document_params)
    else
      @document = Document.new(document_params)
      @pet = @document.pet
    end
    @document.uploaded_by = current_user
    authorize @document

    if @document.save
      redirect_to @document, notice: 'Documento subido exitosamente.'
    else
      @pets = policy_scope(Pet).active unless @pet.present?
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /documents/:id
  def update
    authorize @document

    if @document.update(document_params)
      redirect_to @document, notice: 'Documento actualizado exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /documents/:id
  def destroy
    authorize @document
    @document.destroy

    redirect_to documents_url, notice: 'Documento eliminado exitosamente.'
  end

  # GET /documents/:id/download
  def download
    authorize @document, :download?
    # Implementation for file download
    # send_file @document.file_path, filename: @document.file_name
    redirect_to @document, notice: 'Descarga de archivo (por implementar con Active Storage)'
  end

  # POST /documents/:id/share
  def share
    authorize @document, :show?
    # TODO: Implement sharing functionality (email, link generation, etc.)
    redirect_to @document, notice: 'Funcionalidad de compartir pendiente de implementación'
  end

  private

  def set_document
    @document = Document.includes(:pet, :uploaded_by, :medical_record).find(params[:id])
  end

  def set_pet
    if params[:pet_id].present?
      begin
        @pet = Pet.includes(:user).find(params[:pet_id])
        authorize @pet, :show? if @pet
      rescue ActiveRecord::RecordNotFound
        @pet = nil
      end
    end
  end

  def document_params
    params.require(:document).permit(
      :pet_id, :title, :document_type, :description, :file_name,
      :file_path, :content_type, :file_size, :medical_record_id
    )
  end
end
