# frozen_string_literal: true

class CreatePets < ActiveRecord::Migration[7.1]
  def change
    create_table :pets do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :name, null: false
      t.string :species, null: false
      t.string :breed
      t.date :date_of_birth
      t.string :gender
      t.text :notes
      t.string :microchip_number
      t.decimal :weight, precision: 6, scale: 2
      t.string :color

      t.timestamps
    end

    add_index :pets, [:user_id, :name]
    add_index :pets, :species
  end
end
