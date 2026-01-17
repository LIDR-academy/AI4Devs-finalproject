class RenameScheduledAtToAppointmentDate < ActiveRecord::Migration[7.1]
  def change
    rename_column :appointments, :scheduled_at, :appointment_date
  end
end
