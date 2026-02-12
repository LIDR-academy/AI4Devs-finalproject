# frozen_string_literal: true

# Base controller for all API endpoints
# Handles authentication, error handling, and JSON responses
module Api
  class BaseController < ActionController::Base
    include Pundit::Authorization
    
    # Skip CSRF protection for API
    skip_before_action :verify_authenticity_token
    
    # Note: We don't need to skip authenticate_user! here because we inherit from
    # ActionController::Base, not ApplicationController, so authenticate_user! is never defined
    
    # Handle authentication
    before_action :authenticate_api_user!
    before_action :set_default_format
    
    # Handle authorization errors
    rescue_from Pundit::NotAuthorizedError, with: :handle_unauthorized
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error
    rescue_from ArgumentError, with: :handle_bad_request
    
    protected
    
    # Authenticate user via API token
    def authenticate_api_user!
      token = extract_token_from_header
      
      unless token
        render json: { 
          error: 'Unauthorized',
          message: 'Missing or invalid authentication token'
        }, status: :unauthorized
        return false
      end
      
      @current_user = find_user_by_token(token)
      
      unless @current_user
        render json: { 
          error: 'Unauthorized',
          message: 'Invalid or expired authentication token'
        }, status: :unauthorized
        return false
      end
      
      true
    end
    
    # Get current authenticated user
    def current_user
      @current_user
    end
    
    # Set default format to JSON
    def set_default_format
      request.format = :json
    end
    
    # Extract token from Authorization header
    def extract_token_from_header
      auth_header = request.headers['Authorization']
      return nil unless auth_header
      
      # Support both "Bearer <token>" and "<token>" formats
      auth_header.gsub(/^Bearer\s+/i, '').strip
    end
    
    # Find user by API token
    # For now, using a simple token stored in the database
    # Can be upgraded to JWT later
    def find_user_by_token(token)
      # Simple token authentication - token is stored in api_token field
      # In production, use JWT or a more secure token system
      User.find_by(api_token: token)
    end
    
    # Handle unauthorized access
    def handle_unauthorized(exception)
      render json: {
        error: 'Forbidden',
        message: exception.message || 'You are not authorized to perform this action'
      }, status: :forbidden
    end
    
    # Handle record not found
    def handle_not_found(exception)
      render json: {
        error: 'Not Found',
        message: exception.message || 'Resource not found'
      }, status: :not_found
    end
    
    # Handle validation errors
    def handle_validation_error(exception)
      render json: {
        error: 'Validation Error',
        message: exception.record.errors.full_messages.join(', ')
      }, status: :unprocessable_entity
    end
    
    # Handle bad request
    def handle_bad_request(exception)
      render json: {
        error: 'Bad Request',
        message: exception.message
      }, status: :bad_request
    end
    
    # Render success response
    def render_success(data, status: :ok)
      render json: data, status: status
    end
    
    # Render error response
    def render_error(message, status: :unprocessable_entity, errors: nil)
      response = {
        error: message
      }
      response[:errors] = errors if errors.present?
      render json: response, status: status
    end
    
    # Skip Pundit verification for API (we handle it manually)
    def skip_pundit?
      true
    end
  end
end
