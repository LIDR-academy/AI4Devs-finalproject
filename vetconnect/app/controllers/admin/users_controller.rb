# frozen_string_literal: true

module Admin
  class UsersController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_admin!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    before_action :set_user, only: [:show, :edit, :update, :destroy]

    def index
      @users = User.order(created_at: :desc).page(params[:page])
    end

    def show
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(user_params)
      
      if @user.save
        redirect_to admin_user_path(@user), notice: 'User created successfully.'
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @user.update(user_params)
        redirect_to admin_user_path(@user), notice: 'User updated successfully.'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @user.destroy
      redirect_to admin_users_path, notice: 'User deleted successfully.'
    end

    private

    def ensure_admin!
      redirect_to root_path, alert: 'Access denied' unless current_user.admin?
    end

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(
        :email, :first_name, :last_name, :phone, :role,
        :password, :password_confirmation
      )
    end
  end
end
