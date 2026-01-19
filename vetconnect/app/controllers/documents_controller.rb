# frozen_string_literal: true

class DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :edit, :update, :destroy, :download]
  before_action :set_pet, only: [:new, :create]

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
    @document = @pet.documents.build(uploaded_by: current_user)
    authorize @document
  end

  # GET /documents/:id/edit
  def edit
    authorize @document
  end

  # POST /documents
  def create
    @document = @pet.documents.build(document_params)
    @document.uploaded_by = current_user
    authorize @document

    if @document.save
      redirect_to @document, notice: 'Documento subido exitosamente.'
    else
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

  private

  def set_document
    @document = Document.includes(:pet, :uploaded_by, :medical_record).find(params[:id])
  end

  def set_pet
    @pet = Pet.includes(:user).find(params[:pet_id])
  end

  def document_params
    params.require(:document).permit(
      :title, :document_type, :description, :file_name,
      :file_path, :content_type, :file_size, :medical_record_id
    )
  end
end
