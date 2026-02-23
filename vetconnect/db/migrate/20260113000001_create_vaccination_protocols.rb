# frozen_string_literal: true

class CreateVaccinationProtocols < ActiveRecord::Migration[7.1]
  def change
    create_table :vaccination_protocols do |t|
      # Información del protocolo
      t.string :species, null: false, limit: 50 # dog, cat, rabbit, bird, etc.
      t.string :vaccine_type, null: false, limit: 50 # rabies, dhpp, bordetella, etc.
      t.integer :dose_number, null: false, default: 1
      
      # Edad mínima para aplicar esta dosis (en semanas)
      t.integer :minimum_age_weeks, null: false
      
      # Intervalo hasta la próxima dosis (en semanas)
      t.integer :next_dose_interval_weeks, null: false
      
      # Descripción opcional del protocolo
      t.text :description
      
      t.timestamps
    end
    
    # Índices para búsquedas frecuentes
    add_index :vaccination_protocols, [:species, :vaccine_type, :dose_number], 
              unique: true, 
              name: 'index_vaccination_protocols_on_species_type_dose'
    add_index :vaccination_protocols, :species
    add_index :vaccination_protocols, :vaccine_type
  end
end
