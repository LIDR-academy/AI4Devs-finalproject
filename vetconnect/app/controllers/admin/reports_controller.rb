# frozen_string_literal: true

module Admin
  class ReportsController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_admin!
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      @reports = [
        { id: 'appointments', name: 'Appointments Report', description: 'Summary of all appointments' },
        { id: 'users', name: 'Users Report', description: 'User statistics and activity' },
        { id: 'pets', name: 'Pets Report', description: 'Pet registration statistics' }
      ]
    end

    def show
      @report_type = params[:id]
      
      case @report_type
      when 'appointments'
        @data = generate_appointments_report
      when 'users'
        @data = generate_users_report
      when 'pets'
        @data = generate_pets_report
      else
        redirect_to admin_reports_path, alert: 'Report not found'
      end
    end

    private

    def ensure_admin!
      redirect_to root_path, alert: 'Access denied' unless current_user.admin?
    end

    def generate_appointments_report
      {
        total: Appointment.count,
        by_status: Appointment.group(:status).count,
        upcoming: Appointment.upcoming.count,
        this_month: Appointment.where('created_at >= ?', 1.month.ago).count
      }
    end

    def generate_users_report
      {
        total: User.count,
        by_role: User.group(:role).count,
        confirmed: User.confirmed.count,
        recent: User.where('created_at >= ?', 1.month.ago).count
      }
    end

    def generate_pets_report
      {
        total: Pet.count,
        active: Pet.active.count,
        by_species: Pet.group(:species).count,
        recent: Pet.where('created_at >= ?', 1.month.ago).count
      }
    end
  end
end
