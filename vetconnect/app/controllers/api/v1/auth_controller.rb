# frozen_string_literal: true

module Api
  module V1
    # Authentication controller for API
    # Handles login and token generation
    class AuthController < Api::BaseController
      skip_before_action :authenticate_api_user!, only: [:login]
      
      # POST /api/v1/auth/login
      def login
        email = params[:email]
        password = params[:password]
        
        unless email.present? && password.present?
          return render_error('Email and password are required', status: :bad_request)
        end
        
        user = User.find_by(email: email.downcase.strip)
        
        unless user&.valid_password?(password)
          return render_error('Invalid email or password', status: :unauthorized)
        end
        
        unless user.confirmed?
          return render_error('Please confirm your email address before logging in', status: :unauthorized)
        end
        
        # Generate or retrieve API token
        token = user.api_token || user.generate_api_token!
        
        render json: {
          token: token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.full_name,
            first_name: user.first_name,
            last_name: user.last_name
          },
          expires_at: nil # Token doesn't expire (can be upgraded to JWT with expiration)
        }, status: :ok
      end
      
      # POST /api/v1/auth/logout
      def logout
        # For simple token auth, we could invalidate the token
        # For now, just return success
        # In production with JWT, this would blacklist the token
        render json: { message: 'Logged out successfully' }, status: :ok
      end
      
      # GET /api/v1/auth/me
      def me
        render json: {
          id: current_user.id,
          email: current_user.email,
          role: current_user.role,
          name: current_user.full_name,
          first_name: current_user.first_name,
          last_name: current_user.last_name,
          phone: current_user.phone
        }, status: :ok
      end
    end
  end
end
