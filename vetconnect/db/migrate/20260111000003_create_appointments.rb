# frozen_string_literal: true

class CreateAppointments < ActiveRecord::Migration[7.1]
  def change
    create_table :appointments do |t|
      t.references :pet, null: false, foreign_key: true, index: true
      t.references :veterinarian, null: false, foreign_key: { to_table: :users }, index: true
      t.datetime :scheduled_at, null: false
      t.integer :duration_minutes, default: 30
      t.integer :status, default: 0, null: false # scheduled, confirmed, completed, cancelled
      t.string :appointment_type
      t.text :reason
      t.text :notes

      t.timestamps
    end

    add_index :appointments, [:pet_id, :scheduled_at]
    add_index :appointments, [:veterinarian_id, :scheduled_at]
    add_index :appointments, :status
  end
end
