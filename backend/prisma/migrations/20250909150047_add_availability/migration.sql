-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Availability_doctor_id_idx" ON "Availability"("doctor_id");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
