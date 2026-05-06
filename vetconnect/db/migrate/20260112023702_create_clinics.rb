class CreateClinics < ActiveRecord::Migration[7.1]
  def change
    create_table :clinics do |t|
      t.string :name, null: false
      t.text :address, null: false
      t.string :phone, null: false
      t.string :email
      t.text :operating_hours # JSON stored as text for SQLite compatibility
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :clinics, :name
    add_index :clinics, :active
  end
end
