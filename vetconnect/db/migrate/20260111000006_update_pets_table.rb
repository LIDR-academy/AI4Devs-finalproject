# frozen_string_literal: true

class UpdatePetsTable < ActiveRecord::Migration[7.1]
  def change
    # Rename date_of_birth to birth_date
    rename_column :pets, :date_of_birth, :birth_date if column_exists?(:pets, :date_of_birth)
    
    # Rename notes to special_notes
    rename_column :pets, :notes, :special_notes if column_exists?(:pets, :notes)
    
    # Add active column
    add_column :pets, :active, :boolean, default: true, null: false unless column_exists?(:pets, :active)
    
    # Add unique index for microchip_number (partial index to allow NULL)
    add_index :pets, :microchip_number, unique: true, where: "microchip_number IS NOT NULL", 
              name: 'index_pets_on_microchip_number_unique' unless index_exists?(:pets, :microchip_number, name: 'index_pets_on_microchip_number_unique')
    
    # Add index for active status
    add_index :pets, :active unless index_exists?(:pets, :active)
    
    # Ensure birth_date is not null
    change_column_null :pets, :birth_date, false if column_exists?(:pets, :birth_date)
    
    # Ensure gender is not null
    change_column_null :pets, :gender, false if column_exists?(:pets, :gender)
  end
end
