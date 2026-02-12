# frozen_string_literal: true

require 'stringio'

# Setup controller - Initializes the application with default admin user
# Only works if no admin users exist (one-time setup)
# This allows initializing production without shell access
class SetupController < ActionController::Base
  # Skip CSRF protection for setup endpoint (one-time use)
  skip_before_action :verify_authenticity_token

  # GET /setup
  # Shows setup status and allows initialization
  def show
    admin_exists = User.exists?(role: :admin)
    user_count = User.count

    @initialized = admin_exists
    @user_count = user_count

    # Render HTML view if request accepts HTML, otherwise JSON
    respond_to do |format|
      format.html # renders show.html.erb
      format.json do
        render json: {
          initialized: admin_exists,
          user_count: user_count,
          message: admin_exists ? 'Application already initialized' : 'Application not initialized',
          instructions: admin_exists ? nil : 'POST to /setup/initialize to create admin user'
        }, status: :ok
      end
    end
  end

  # POST /setup/initialize
  # Creates the default admin user if no admin exists
  def initialize_app
    # Security check: Only allow if no admin users exist
    if User.exists?(role: :admin)
      return render json: {
        success: false,
        message: 'Application already initialized. Admin user already exists.',
        error: 'Cannot initialize: admin user already exists'
      }, status: :forbidden
    end

    # Create admin user
    begin
      admin = User.create!(
        email: 'admin@vetconnect.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'Ana',
        last_name: 'Administradora',
        phone: '+1234567890',
        role: :admin,
        confirmed_at: Time.current
      )

      render json: {
        success: true,
        message: 'Application initialized successfully',
        admin_user: {
          email: admin.email,
          role: admin.role,
          confirmed: admin.confirmed?
        },
        warning: '⚠️ IMPORTANT: Change the default password after first login!',
        next_steps: [
          'Login at /users/sign_in',
          'Email: admin@vetconnect.com',
          'Password: password123',
          'Change password immediately after login'
        ]
      }, status: :created
    rescue StandardError => e
      render json: {
        success: false,
        message: 'Failed to initialize application',
        error: e.message,
        backtrace: Rails.env.development? ? e.backtrace : nil
      }, status: :internal_server_error
    end
  end

  # POST /setup/seed
  # Runs full database seeds (creates all demo data)
  # Safety checks:
  # - If no users exist: runs automatically
  # - If users exist: requires ALLOW_SEED_IN_PRODUCTION=true env var
  def seed
    users_exist = User.exists?
    allow_force_seed = ENV['ALLOW_SEED_IN_PRODUCTION'] == 'true'
    
    # Security check: If users exist, require explicit permission
    if users_exist && !allow_force_seed
      return render json: {
        success: false,
        message: 'Cannot run seeds: Users already exist',
        error: 'Seeds can only run on empty database',
        suggestion: 'Set ALLOW_SEED_IN_PRODUCTION=true environment variable to force seed execution',
        warning: '⚠️ WARNING: Running seeds on existing database will create duplicate data!'
      }, status: :forbidden
    end
    
    # Warn if forcing seed on existing database
    if users_exist && allow_force_seed
      Rails.logger.warn("⚠️ FORCING SEED EXECUTION: Users exist (#{User.count} users) but ALLOW_SEED_IN_PRODUCTION=true")
    end

    begin
      # Suppress stdout during seed execution (seeds.rb uses puts)
      original_stdout = $stdout
      $stdout = StringIO.new unless Rails.env.development?
      
      # Load and execute seeds
      load Rails.root.join('db', 'seeds.rb')
      
      # Restore stdout
      $stdout = original_stdout unless Rails.env.development?

      render json: {
        success: true,
        message: 'Database seeded successfully',
        forced: users_exist && allow_force_seed,
        stats: {
          users: User.count,
          clinics: Clinic.count,
          pets: Pet.count,
          appointments: Appointment.count
        },
        credentials: {
          admin: 'admin@vetconnect.com / password123',
          veterinarian: 'carlos@vetconnect.com / password123',
          owner: 'maria@example.com / password123'
        },
        warning: '⚠️ IMPORTANT: Change all default passwords after first login!',
        note: users_exist ? '⚠️ Seeds executed on existing database - may have duplicate data' : nil
      }, status: :created
    rescue StandardError => e
      # Restore stdout in case of error
      $stdout = original_stdout unless Rails.env.development?
      
      render json: {
        success: false,
        message: 'Failed to seed database',
        error: e.message,
        backtrace: Rails.env.development? ? e.backtrace : nil
      }, status: :internal_server_error
    end
  end
end
