class AddClinicToAppointments < ActiveRecord::Migration[7.1]
  def change
    # Add clinic reference (nullable initially for existing records)
    add_reference :appointments, :clinic, foreign_key: true, index: true
    
    # Add reminder and cancellation tracking
    add_column :appointments, :reminder_sent_at, :datetime
    add_column :appointments, :cancellation_reason, :text
    
    # Add indices for performance
    add_index :appointments, :reminder_sent_at
    add_index :appointments, [:clinic_id, :appointment_date] if column_exists?(:appointments, :appointment_date)
  end
end
