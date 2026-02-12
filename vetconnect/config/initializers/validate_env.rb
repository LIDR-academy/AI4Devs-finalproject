# frozen_string_literal: true

# Environment Variable Validation
# Validates that all required environment variables are set in production
# Uses Rails.application.config.after_initialize to ensure logger is available

Rails.application.config.after_initialize do
  if Rails.env.production?
    required_vars = %w[SECRET_KEY_BASE DATABASE_URL HOST]
    missing_vars = required_vars.reject { |var| ENV[var].present? }
    
    if missing_vars.any?
      Rails.logger.error "❌ Missing required environment variables: #{missing_vars.join(', ')}"
      Rails.logger.error "Application may not start correctly without these variables."
      # Don't raise in production to allow graceful degradation, but log the error
    else
      Rails.logger.info "✅ All required environment variables are set"
    end
    
    # Warn about optional but recommended variables
    recommended_vars = {
      'REDIS_URL' => 'Redis cache and sessions',
      'SMTP_ADDRESS' => 'Email delivery',
      'ROLLBAR_ACCESS_TOKEN' => 'Error tracking'
    }
    
    missing_recommended = recommended_vars.keys.reject { |var| ENV[var].present? }
    if missing_recommended.any?
      Rails.logger.warn "⚠️  Recommended environment variables not set: #{missing_recommended.join(', ')}"
      missing_recommended.each do |var|
        Rails.logger.warn "   - #{var}: #{recommended_vars[var]}"
      end
    end
  end
end
