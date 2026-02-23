# frozen_string_literal: true

class CreateVaccinations < ActiveRecord::Migration[7.1]
  def change
    create_table :vaccinations do |t|
      # Relaciones
      t.references :pet, null: false, foreign_key: true, index: true
      t.references :medical_record, foreign_key: true, null: true
      t.references :veterinarian, null: false, foreign_key: { to_table: :users }, index: true
      
      # Información de la vacuna
      t.string :vaccine_name, null: false, limit: 100
      t.string :vaccine_type, null: false, limit: 50, index: true
      # Valores: rabies, dhpp, bordetella, leptospirosis, 
      # feline_distemper, feline_leukemia, other
      
      t.string :manufacturer, limit: 100
      t.string :lot_number, limit: 50, index: true
      
      # Fechas críticas
      t.date :administered_at, null: false, index: true
      t.date :expires_at # Expiración del lote
      t.date :next_due_date, index: true # Calculado automáticamente
      
      # Información de dosis
      t.integer :dose_number, null: false, default: 1
      
      # Notas y observaciones
      t.text :notes
      
      t.timestamps
    end
    
    # Índices compuestos para queries frecuentes
    add_index :vaccinations, [:pet_id, :next_due_date], 
              name: 'index_vaccinations_on_pet_and_next_due'
    add_index :vaccinations, [:vaccine_type, :administered_at],
              name: 'index_vaccinations_on_type_and_date'
    add_index :vaccinations, [:veterinarian_id, :administered_at],
              name: 'index_vaccinations_on_vet_and_date'
    
    # Constraint para asegurar que dose_number >= 1
    # SQLite no soporta CHECK constraints directamente, se validará en el modelo
  end
end
