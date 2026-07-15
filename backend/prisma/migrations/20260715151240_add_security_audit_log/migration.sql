-- CreateTable
CREATE TABLE "SecurityAuditLog" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "outcome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
