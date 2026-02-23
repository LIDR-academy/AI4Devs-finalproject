# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update, :destroy, :change_role]

  # GET /users
  def index
    @users = policy_scope(User).order(created_at: :desc)
    
    # Filter by role if provided
    @users = @users.where(role: params[:role]) if params[:role].present?
  end

  # GET /users/:id
  def show
    authorize @user
  end

  # GET /users/new
  def new
    @user = User.new
    authorize @user
  end

  # GET /users/:id/edit
  def edit
    authorize @user
  end

  # POST /users
  def create
    @user = User.new(user_params)
    authorize @user

    if @user.save
      redirect_to @user, notice: 'Usuario creado exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/:id
  def update
    authorize @user

    # Don't allow role change through regular update
    update_params = user_params
    update_params = update_params.except(:role) unless policy(@user).change_role?

    if @user.update(update_params)
      redirect_to @user, notice: 'Usuario actualizado exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /users/:id
  def destroy
    authorize @user
    @user.destroy

    redirect_to users_url, notice: 'Usuario eliminado exitosamente.'
  end

  # PATCH /users/:id/change_role
  def change_role
    authorize @user, :change_role?

    if @user.update(role: params[:role])
      redirect_to @user, notice: 'Rol actualizado exitosamente.'
    else
      redirect_to @user, alert: 'No se pudo actualizar el rol.'
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(
      :email, :password, :password_confirmation,
      :first_name, :last_name, :phone, :role
    )
  end
end
