# frozen_string_literal: true

# Rollbar Error Tracking Configuration
# Free tier: 5,000 events/month, 30-day retention
#
# Setup:
# 1. Sign up at https://rollbar.com (free tier available)
# 2. Create a new project and get your access token
# 3. Set ROLLBAR_ACCESS_TOKEN environment variable in Render dashboard
# 4. Deploy and errors will be automatically tracked

begin
  if Rails.env.production? && ENV['ROLLBAR_ACCESS_TOKEN'].present?
    Rollbar.configure do |config|
      config.access_token = ENV['ROLLBAR_ACCESS_TOKEN']
      config.environment = Rails.env
      config.enabled = true
      
      # Customize error reporting
      config.exception_level_filters.merge!(
        'ActionController::RoutingError' => 'ignore',
        'AbstractController::ActionNotFound' => 'ignore'
      )
      
      # Add custom data to all reports
      config.custom_data_method = lambda do |request|
        {
          user_id: request.env['warden']&.user&.id,
          ip: request.ip,
          user_agent: request.user_agent
        }
      end
      
      # Ignore certain exceptions
      config.ignored_exceptions += [
        'ActionController::InvalidAuthenticityToken',
        'ActionController::RoutingError',
        'ActionDispatch::RemoteIp::IpSpoafAttackError'
      ]
    end
  else
    # Disable Rollbar in development/test or if token is not set
    Rollbar.configure do |config|
      config.enabled = false
    end
  end
rescue LoadError, NameError => e
  # Rollbar gem not available or not loaded - silently skip
  Rails.logger.warn("Rollbar not available: #{e.message}") if defined?(Rails.logger)
end
