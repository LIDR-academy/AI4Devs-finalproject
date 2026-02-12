# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_13_000003) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "appointments", force: :cascade do |t|
    t.integer "pet_id", null: false
    t.integer "veterinarian_id", null: false
    t.datetime "appointment_date", null: false
    t.integer "duration_minutes", default: 30
    t.integer "status", default: 0, null: false
    t.string "appointment_type"
    t.text "reason"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "clinic_id"
    t.datetime "reminder_sent_at"
    t.text "cancellation_reason"
    t.index ["clinic_id"], name: "index_appointments_on_clinic_id"
    t.index ["pet_id", "appointment_date"], name: "index_appointments_on_pet_id_and_appointment_date"
    t.index ["pet_id"], name: "index_appointments_on_pet_id"
    t.index ["reminder_sent_at"], name: "index_appointments_on_reminder_sent_at"
    t.index ["status"], name: "index_appointments_on_status"
    t.index ["veterinarian_id", "appointment_date"], name: "index_appointments_on_veterinarian_id_and_appointment_date"
    t.index ["veterinarian_id"], name: "index_appointments_on_veterinarian_id"
  end

  create_table "clinics", force: :cascade do |t|
    t.string "name", null: false
    t.text "address", null: false
    t.string "phone", null: false
    t.string "email"
    t.text "operating_hours"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_clinics_on_active"
    t.index ["name"], name: "index_clinics_on_name"
  end

  create_table "documents", force: :cascade do |t|
    t.integer "pet_id", null: false
    t.integer "uploaded_by_id", null: false
    t.integer "medical_record_id"
    t.string "title", null: false
    t.string "document_type", null: false
    t.text "description"
    t.string "file_name"
    t.string "file_path"
    t.string "content_type"
    t.integer "file_size"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_type"], name: "index_documents_on_document_type"
    t.index ["medical_record_id"], name: "index_documents_on_medical_record_id"
    t.index ["pet_id", "document_type"], name: "index_documents_on_pet_id_and_document_type"
    t.index ["pet_id"], name: "index_documents_on_pet_id"
    t.index ["uploaded_by_id"], name: "index_documents_on_uploaded_by_id"
  end

  create_table "medical_records", force: :cascade do |t|
    t.integer "pet_id", null: false
    t.integer "veterinarian_id", null: false
    t.integer "appointment_id"
    t.date "visit_date", null: false
    t.string "record_type", null: false
    t.text "diagnosis"
    t.text "treatment"
    t.text "prescription"
    t.text "notes"
    t.decimal "weight", precision: 6, scale: 2
    t.decimal "temperature", precision: 4, scale: 1
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["appointment_id"], name: "index_medical_records_on_appointment_id"
    t.index ["pet_id", "visit_date"], name: "index_medical_records_on_pet_id_and_visit_date"
    t.index ["pet_id"], name: "index_medical_records_on_pet_id"
    t.index ["record_type"], name: "index_medical_records_on_record_type"
    t.index ["veterinarian_id"], name: "index_medical_records_on_veterinarian_id"
  end

  create_table "pets", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name", null: false
    t.string "species", null: false
    t.string "breed"
    t.date "birth_date", null: false
    t.string "gender", null: false
    t.text "special_notes"
    t.string "microchip_number"
    t.decimal "weight", precision: 6, scale: 2
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active", default: true, null: false
    t.index ["active"], name: "index_pets_on_active"
    t.index ["microchip_number"], name: "index_pets_on_microchip_number_unique", unique: true, where: "microchip_number IS NOT NULL"
    t.index ["species"], name: "index_pets_on_species"
    t.index ["user_id", "name"], name: "index_pets_on_user_id_and_name"
    t.index ["user_id"], name: "index_pets_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "phone"
    t.integer "role", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "api_token"
    t.index ["api_token"], name: "index_users_on_api_token", unique: true
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role", "confirmed_at"], name: "index_users_on_role_and_confirmed_at"
    t.index ["role"], name: "index_users_on_role"
  end

  create_table "vaccination_protocols", force: :cascade do |t|
    t.string "species", limit: 50, null: false
    t.string "vaccine_type", limit: 50, null: false
    t.integer "dose_number", default: 1, null: false
    t.integer "minimum_age_weeks", null: false
    t.integer "next_dose_interval_weeks", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["species", "vaccine_type", "dose_number"], name: "index_vaccination_protocols_on_species_type_dose", unique: true
    t.index ["species"], name: "index_vaccination_protocols_on_species"
    t.index ["vaccine_type"], name: "index_vaccination_protocols_on_vaccine_type"
  end

  create_table "vaccinations", force: :cascade do |t|
    t.integer "pet_id", null: false
    t.integer "medical_record_id"
    t.integer "veterinarian_id", null: false
    t.string "vaccine_name", limit: 100, null: false
    t.string "vaccine_type", limit: 50, null: false
    t.string "manufacturer", limit: 100
    t.string "lot_number", limit: 50
    t.date "administered_at", null: false
    t.date "expires_at"
    t.date "next_due_date"
    t.integer "dose_number", default: 1, null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["administered_at"], name: "index_vaccinations_on_administered_at"
    t.index ["lot_number"], name: "index_vaccinations_on_lot_number"
    t.index ["medical_record_id"], name: "index_vaccinations_on_medical_record_id"
    t.index ["next_due_date"], name: "index_vaccinations_on_next_due_date"
    t.index ["pet_id", "next_due_date"], name: "index_vaccinations_on_pet_and_next_due"
    t.index ["pet_id"], name: "index_vaccinations_on_pet_id"
    t.index ["vaccine_type", "administered_at"], name: "index_vaccinations_on_type_and_date"
    t.index ["vaccine_type"], name: "index_vaccinations_on_vaccine_type"
    t.index ["veterinarian_id", "administered_at"], name: "index_vaccinations_on_vet_and_date"
    t.index ["veterinarian_id"], name: "index_vaccinations_on_veterinarian_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "appointments", "clinics"
  add_foreign_key "appointments", "pets"
  add_foreign_key "appointments", "users", column: "veterinarian_id"
  add_foreign_key "documents", "medical_records"
  add_foreign_key "documents", "pets"
  add_foreign_key "documents", "users", column: "uploaded_by_id"
  add_foreign_key "medical_records", "appointments"
  add_foreign_key "medical_records", "pets"
  add_foreign_key "medical_records", "users", column: "veterinarian_id"
  add_foreign_key "pets", "users"
  add_foreign_key "vaccinations", "medical_records"
  add_foreign_key "vaccinations", "pets"
  add_foreign_key "vaccinations", "users", column: "veterinarian_id"
end
