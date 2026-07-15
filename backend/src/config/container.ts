import { PrismaClient } from "@prisma/client";
import { CreateCoach } from "../application/use-cases/CreateCoach.js";
import { CreateCoachee } from "../application/use-cases/CreateCoachee.js";
import { GetCoach } from "../application/use-cases/GetCoach.js";
import { GetCoachee } from "../application/use-cases/GetCoachee.js";
import { GetCoachFinancialData } from "../application/use-cases/GetCoachFinancialData.js";
import { ListCoachees } from "../application/use-cases/ListCoachees.js";
import { ListCoaches } from "../application/use-cases/ListCoaches.js";
import { UpdateCoach } from "../application/use-cases/UpdateCoach.js";
import { UpdateCoachee } from "../application/use-cases/UpdateCoachee.js";
import { UpdateCoacheeLevel } from "../application/use-cases/UpdateCoacheeLevel.js";
import { UpdateCoacheeStatus } from "../application/use-cases/UpdateCoacheeStatus.js";
import { UpdateCoachStatus } from "../application/use-cases/UpdateCoachStatus.js";
import { CoacheeService } from "../domain/services/CoacheeService.js";
import { CoachService } from "../domain/services/CoachService.js";
import { Aes256GcmEncryptionService } from "../infrastructure/encryption/Aes256GcmEncryptionService.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";
import { PrismaCoacheeRepository } from "../infrastructure/persistence/PrismaCoacheeRepository.js";
import { PrismaCoachRepository } from "../infrastructure/persistence/PrismaCoachRepository.js";
import { env } from "./env.js";

const prisma = new PrismaClient();

const coacheeRepository = new PrismaCoacheeRepository();
const coacheeService = new CoacheeService(coacheeRepository);

const coachRepository = new PrismaCoachRepository();
const coachService = new CoachService(coachRepository);
const encryptionService = new Aes256GcmEncryptionService(env.COACH_FINANCIAL_ENCRYPTION_KEY);
const auditLogger = new AuditLogger(prisma);

export const container = {
  prisma,
  coacheeRepository,
  coacheeService,
  createCoachee: new CreateCoachee(coacheeRepository, coacheeService),
  listCoachees: new ListCoachees(coacheeRepository),
  getCoachee: new GetCoachee(coacheeRepository),
  updateCoachee: new UpdateCoachee(coacheeRepository, coacheeService),
  updateCoacheeStatus: new UpdateCoacheeStatus(coacheeRepository),
  updateCoacheeLevel: new UpdateCoacheeLevel(coacheeRepository),
  coachRepository,
  coachService,
  encryptionService,
  auditLogger,
  createCoach: new CreateCoach(coachRepository, coachService, encryptionService),
  listCoaches: new ListCoaches(coachRepository),
  getCoach: new GetCoach(coachRepository),
  updateCoach: new UpdateCoach(coachRepository, coachService),
  updateCoachStatus: new UpdateCoachStatus(coachRepository),
  getCoachFinancialData: new GetCoachFinancialData(coachRepository, encryptionService),
};
