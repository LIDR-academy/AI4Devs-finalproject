# frozen_string_literal: true

class CreateMedicalRecords < ActiveRecord::Migration[7.1]
  def change
    create_table :medical_records do |t|
      t.references :pet, null: false, foreign_key: true, index: true
      t.references :veterinarian, null: false, foreign_key: { to_table: :users }, index: true
      t.references :appointment, foreign_key: true
      t.date :visit_date, null: false
      t.string :record_type, null: false # consultation, vaccination, surgery, etc.
      t.text :diagnosis
      t.text :treatment
      t.text :prescription
      t.text :notes
      t.decimal :weight, precision: 6, scale: 2
      t.decimal :temperature, precision: 4, scale: 1

      t.timestamps
    end

    add_index :medical_records, [:pet_id, :visit_date]
    add_index :medical_records, :record_type
  end
end
