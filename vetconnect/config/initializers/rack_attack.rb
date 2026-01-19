# frozen_string_literal: true

# Rack Attack configuration for rate limiting and security
class Rack::Attack
  # Throttle all requests by IP (60rpm)
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end

  # Throttle POST requests to /users/sign_in by IP address
  # Limit to 5 login attempts per minute per IP
  throttle('logins/ip', limit: 5, period: 1.minute) do |req|
    if req.path == '/users/sign_in' && req.post?
      req.ip
    end
  end

  # Throttle POST requests to /users/sign_in by email param
  # Limit to 5 login attempts per minute per email
  throttle('logins/email', limit: 5, period: 1.minute) do |req|
    if req.path == '/users/sign_in' && req.post?
      # Normalize the email, using the same logic as your authentication process, to
      # protect against rate limit bypasses.
      req.params['user']['email'].to_s.downcase.gsub(/\s+/, '') if req.params['user']
    end
  end

  # Throttle password reset requests
  throttle('password_resets/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/users/password' && req.post?
      req.ip
    end
  end

  # Throttle registration requests
  throttle('registrations/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/users' && req.post?
      req.ip
    end
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{ error: 'Too many requests. Please try again later.' }.to_json]
    ]
  end
end
