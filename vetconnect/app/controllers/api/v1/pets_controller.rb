# frozen_string_literal: true

module Api
  module V1
    # API controller for Pets
    class PetsController < Api::BaseController
      before_action :set_pet, only: [:show]
      
      # GET /api/v1/pets
      def index
        @pets = policy_scope(Pet)
                  .active
                  .includes(:user)
                  .page(params[:page] || 1)
                  .per(params[:per_page] || 20)
        
        render :index
      end
      
      # GET /api/v1/pets/:id
      def show
        authorize @pet
        render :show
      end
      
      private
      
      def set_pet
        @pet = Pet.includes(:user, :appointments, :medical_records, :vaccinations, :documents)
                  .find(params[:id])
      end
    end
  end
end
