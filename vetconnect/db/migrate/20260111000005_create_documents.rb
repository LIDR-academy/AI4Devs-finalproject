# frozen_string_literal: true

class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents do |t|
      t.references :pet, null: false, foreign_key: true, index: true
      t.references :uploaded_by, null: false, foreign_key: { to_table: :users }, index: true
      t.references :medical_record, foreign_key: true
      t.string :title, null: false
      t.string :document_type, null: false # lab_result, x_ray, prescription, etc.
      t.text :description
      t.string :file_name
      t.string :file_path
      t.string :content_type
      t.integer :file_size

      t.timestamps
    end

    add_index :documents, [:pet_id, :document_type]
    add_index :documents, :document_type
  end
end
