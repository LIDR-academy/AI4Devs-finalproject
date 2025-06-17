"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1701234567890 = void 0;
class InitialSchema1701234567890 {
    name = 'InitialSchema1701234567890';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
        await queryRunner.query(`
      CREATE TYPE "user_role" AS ENUM(
        'super_admin',
        'barbershop_owner',
        'barber',
        'client'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "appointment_status" AS ENUM(
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "notification_type" AS ENUM(
        'appointment_created',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_reminder',
        'review_request',
        'system_message'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "payment_method_type" AS ENUM(
        'cash',
        'card',
        'transfer',
        'digital_wallet'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "payment_status" AS ENUM(
        'pending',
        'completed',
        'failed',
        'refunded'
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "barbershops" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "address" text NOT NULL,
        "phone" character varying(20),
        "email" character varying(255),
        "open_time" time DEFAULT '09:00:00',
        "close_time" time DEFAULT '18:00:00',
        "working_days" jsonb,
        "timezone" character varying(50) DEFAULT 'America/Mexico_City',
        "is_active" boolean DEFAULT true,
        "logo" text,
        "website" character varying(255),
        "social_media" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_barbershops" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_barbershops_email" UNIQUE ("email")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "phone" character varying(20),
        "role" "user_role" DEFAULT 'client',
        "is_active" boolean DEFAULT true,
        "profile_image" text,
        "date_of_birth" date,
        "gender" character varying(20),
        "barbershop_id" uuid,
        "email_verified" boolean DEFAULT false,
        "email_verification_token" character varying(255),
        "password_reset_token" character varying(255),
        "password_reset_expires" TIMESTAMP WITH TIME ZONE,
        "last_login" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_barbershop" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "barbershop_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "duration_minutes" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "is_active" boolean DEFAULT true,
        "category" character varying(100),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_services" PRIMARY KEY ("id"),
        CONSTRAINT "FK_services_barbershop" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "barber_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "barber_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "custom_price" decimal(10,2),
        "is_available" boolean DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_barber_services" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_barber_services" UNIQUE ("barber_id", "service_id"),
        CONSTRAINT "FK_barber_services_barber" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_barber_services_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "client_id" uuid NOT NULL,
        "barber_id" uuid NOT NULL,
        "barbershop_id" uuid NOT NULL,
        "service_id" uuid,
        "scheduled_date" date NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "status" "appointment_status" DEFAULT 'pending',
        "service_name" character varying(255),
        "price" decimal(10,2),
        "duration_minutes" integer,
        "client_notes" text,
        "barber_notes" text,
        "admin_notes" text,
        "confirmed_at" TIMESTAMP WITH TIME ZONE,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "cancelled_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointments_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointments_barber" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointments_barbershop" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointments_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "barber_availability" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "barber_id" uuid NOT NULL,
        "day_of_week" integer NOT NULL CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6),
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "is_available" boolean DEFAULT true,
        "break_start_time" time,
        "break_end_time" time,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_barber_availability" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_barber_availability" UNIQUE ("barber_id", "day_of_week"),
        CONSTRAINT "FK_barber_availability_barber" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_availability_times" CHECK ("start_time" < "end_time"),
        CONSTRAINT "CHK_break_times" CHECK (
          ("break_start_time" IS NULL AND "break_end_time" IS NULL) OR
          ("break_start_time" IS NOT NULL AND "break_end_time" IS NOT NULL AND 
           "break_start_time" < "break_end_time" AND
           "break_start_time" >= "start_time" AND "break_end_time" <= "end_time")
        )
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appointment_id" uuid NOT NULL,
        "client_id" uuid NOT NULL,
        "barber_id" uuid NOT NULL,
        "barbershop_id" uuid NOT NULL,
        "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
        "comment" text,
        "service_quality" integer CHECK ("service_quality" >= 1 AND "service_quality" <= 5),
        "punctuality" integer CHECK ("punctuality" >= 1 AND "punctuality" <= 5),
        "cleanliness" integer CHECK ("cleanliness" >= 1 AND "cleanliness" <= 5),
        "is_visible" boolean DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_appointment" UNIQUE ("appointment_id"),
        CONSTRAINT "FK_reviews_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_barber" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_barbershop" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "notification_type" NOT NULL,
        "title" character varying(255) NOT NULL,
        "message" text NOT NULL,
        "data" jsonb,
        "is_read" boolean DEFAULT false,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "barbershop_id" uuid NOT NULL,
        "type" "payment_method_type" NOT NULL,
        "name" character varying(100) NOT NULL,
        "is_active" boolean DEFAULT true,
        "configuration" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_payment_methods" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_methods_barbershop" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appointment_id" uuid NOT NULL,
        "payment_method_id" uuid,
        "amount" decimal(10,2) NOT NULL,
        "status" "payment_status" DEFAULT 'pending',
        "transaction_id" character varying(255),
        "payment_date" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_method" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "barber_schedules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "barber_id" uuid NOT NULL,
        "date" date NOT NULL,
        "start_time" time,
        "end_time" time,
        "is_available" boolean DEFAULT true,
        "reason" character varying(255),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_barber_schedules" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_barber_schedules" UNIQUE ("barber_id", "date"),
        CONSTRAINT "FK_barber_schedules_barber" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "CHK_barber_barbershop" 
      CHECK (
        ("role" IN ('barber', 'barbershop_owner') AND "barbershop_id" IS NOT NULL) OR 
        ("role" IN ('client', 'super_admin'))
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "appointments" ADD CONSTRAINT "CHK_appointment_future_date" 
      CHECK ("scheduled_date" >= CURRENT_DATE OR "status" != 'pending')
    `);
        await this.createIndexes(queryRunner);
        await this.createTriggers(queryRunner);
        await this.insertSeedData(queryRunner);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_barber_barbershop"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "CHK_appointment_future_date"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "barber_schedules"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payment_methods"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "barber_availability"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "barber_services"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "barbershops"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_type"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "notification_type"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "appointment_status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    }
    async createIndexes(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_barbershop_id" ON "users" ("barbershop_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_active" ON "users" ("is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_client_id" ON "appointments" ("client_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_barber_id" ON "appointments" ("barber_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_barbershop_id" ON "appointments" ("barbershop_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_date" ON "appointments" ("scheduled_date")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_status" ON "appointments" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_appointments_date_status" ON "appointments" ("scheduled_date", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_services_barbershop_id" ON "services" ("barbershop_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_services_active" ON "services" ("is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_barber_availability_barber_id" ON "barber_availability" ("barber_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_barber_availability_day" ON "barber_availability" ("day_of_week")`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_barber_id" ON "reviews" ("barber_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_barbershop_id" ON "reviews" ("barbershop_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_rating" ON "reviews" ("rating")`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_unread" ON "notifications" ("user_id", "is_read") WHERE "is_read" = false`);
        await queryRunner.query(`CREATE INDEX "IDX_barbershops_name_trgm" ON "barbershops" USING gin("name" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX "IDX_services_name_trgm" ON "services" USING gin("name" gin_trgm_ops)`);
    }
    async createTriggers(queryRunner) {
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
        await queryRunner.query(`CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON "barbershops" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON "appointments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE TRIGGER update_barber_availability_updated_at BEFORE UPDATE ON "barber_availability" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
    }
    async insertSeedData(queryRunner) {
        await queryRunner.query(`
      INSERT INTO "users" ("email", "password_hash", "first_name", "last_name", "role", "email_verified")
      VALUES (
        'admin@barbersync.pro',
        '$2b$10$rK7Q2zKjE1x7Q3p4M5n6wuLz8h3j4K5l6M7n8O9p0Q1r2S3t4U5v6w', 
        'Super',
        'Admin',
        'super_admin',
        true
      ) ON CONFLICT ("email") DO NOTHING
    `);
    }
}
exports.InitialSchema1701234567890 = InitialSchema1701234567890;
//# sourceMappingURL=001-initial-schema.js.map