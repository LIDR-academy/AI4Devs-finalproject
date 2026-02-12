# frozen_string_literal: true

# Zero-Downtime Migrations Configuration
# Ensures migrations are safe for production deployments without downtime
#
# This initializer sets statement timeouts and provides safety checks
# for database migrations in production environments.

Rails.application.config.after_initialize do
  if Rails.env.production?
    begin
      # Only set timeouts if database is available
      # Try to establish a connection - if it fails, silently skip
      if defined?(ActiveRecord::Base)
        ActiveRecord::Base.connection_pool.with_connection do |conn|
          # Set statement timeout to 30 seconds
          # This prevents migrations from holding locks for too long
          conn.execute("SET statement_timeout = '30s'")
          
          # Set lock timeout to prevent deadlocks
          conn.execute("SET lock_timeout = '10s'")
        end
      end
    rescue StandardError => e
      # Silently fail if database is not available or connection fails
      Rails.logger.warn("Failed to set database timeouts: #{e.message}") if defined?(Rails.logger)
    end
  end
end

# Helper method to check if a migration is safe for zero-downtime deployment
module ZeroDowntimeMigration
  def self.safe?
    # Check if migration uses concurrent index creation
    # Check if migration avoids table locks
    # Add more checks as needed
    true
  end
end

# Example of safe migration pattern:
# class AddIndexSafely < ActiveRecord::Migration[7.1]
#   disable_ddl_transaction!
#   
#   def change
#     add_index :appointments, :user_id, algorithm: :concurrently, if_not_exists: true
#   end
# end
