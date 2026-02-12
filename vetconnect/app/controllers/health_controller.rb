# frozen_string_literal: true

# Health check controller - does not require authentication
# Inherits directly from ActionController::Base to avoid Devise callbacks
# This is used by monitoring services and load balancers
class HealthController < ActionController::Base
  # Skip CSRF protection for health checks (used by monitoring services)
  skip_before_action :verify_authenticity_token

  def show
    checks = {
      status: 'ok',
      timestamp: Time.current.iso8601,
      database: database_check,
      redis: redis_check
    }

    if checks[:database] && checks[:redis]
      render json: checks, status: :ok
    else
      render json: checks.merge(status: 'degraded'), status: :service_unavailable
    end
  end

  private

  def database_check
    ActiveRecord::Base.connection.execute('SELECT 1')
    true
  rescue StandardError
    false
  end

  def redis_check
    redis_url = ENV['REDIS_URL'] || 'redis://localhost:6379/0'
    redis = Redis.new(url: redis_url)
    redis.ping == 'PONG'
  rescue StandardError
    false
  end
end
