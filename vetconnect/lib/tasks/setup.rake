# frozen_string_literal: true

namespace :setup do
  desc 'Initialize application with admin user'
  task initialize: :environment do
    if User.exists?(role: :admin)
      puts '❌ Application already initialized. Admin user already exists.'
      exit 1
    end

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

    puts '✅ Application initialized successfully!'
    puts "   Admin user: #{admin.email}"
    puts '   Password: password123'
    puts '   ⚠️  IMPORTANT: Change the password after first login!'
  end

  desc 'Check setup status'
  task status: :environment do
    admin_exists = User.exists?(role: :admin)
    user_count = User.count

    if admin_exists
      puts '✅ Application is initialized'
      puts "   Total users: #{user_count}"
    else
      puts '❌ Application is not initialized'
      puts '   Run: rake setup:initialize'
    end
  end
end
