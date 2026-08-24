import { PrismaClient } from "@prisma/client";
import { CancelBlock } from "../application/use-cases/CancelBlock.js";
import { CancelEnrollment } from "../application/use-cases/CancelEnrollment.js";
import { CancelRecurringSeries } from "../application/use-cases/CancelRecurringSeries.js";
import { CancelTrainingClass } from "../application/use-cases/CancelTrainingClass.js";
import { ClaimWaitingListSpot } from "../application/use-cases/ClaimWaitingListSpot.js";
import { CreateBlock } from "../application/use-cases/CreateBlock.js";
import { CreateCoach } from "../application/use-cases/CreateCoach.js";
import { CreateCoachee } from "../application/use-cases/CreateCoachee.js";
import { CreateTrainingClass } from "../application/use-cases/CreateTrainingClass.js";
import { GetAvailableSlots } from "../application/use-cases/GetAvailableSlots.js";
import { GetCoach } from "../application/use-cases/GetCoach.js";
import { GetCoachee } from "../application/use-cases/GetCoachee.js";
import { GetCoacheeDashboard } from "../application/use-cases/GetCoacheeDashboard.js";
import { GetCoachFinancialData } from "../application/use-cases/GetCoachFinancialData.js";
import { GetTrainingClass } from "../application/use-cases/GetTrainingClass.js";
import { JoinTrainingClass } from "../application/use-cases/JoinTrainingClass.js";
import { JoinWaitingList } from "../application/use-cases/JoinWaitingList.js";
import { LeaveWaitingList } from "../application/use-cases/LeaveWaitingList.js";
import { ListBlocks } from "../application/use-cases/ListBlocks.js";
import { ListCoachees } from "../application/use-cases/ListCoachees.js";
import { ListCoaches } from "../application/use-cases/ListCoaches.js";
import { ListTrainingClasses } from "../application/use-cases/ListTrainingClasses.js";
import { ListWaitingLists } from "../application/use-cases/ListWaitingLists.js";
import { RegisterDeviceToken } from "../application/use-cases/RegisterDeviceToken.js";
import { SendNotification } from "../application/use-cases/SendNotification.js";
import { UpdateCoach } from "../application/use-cases/UpdateCoach.js";
import { UpdateCoachee } from "../application/use-cases/UpdateCoachee.js";
import { UpdateCoacheeLevel } from "../application/use-cases/UpdateCoacheeLevel.js";
import { UpdateCoacheeStatus } from "../application/use-cases/UpdateCoacheeStatus.js";
import { UpdateCoachStatus } from "../application/use-cases/UpdateCoachStatus.js";
import { UpdateTrainingClass } from "../application/use-cases/UpdateTrainingClass.js";
import type { NotificationSender } from "../domain/ports/NotificationSender.js";
import { BlockPolicy } from "../domain/services/BlockPolicy.js";
import { ClassCancellationPolicy } from "../domain/services/ClassCancellationPolicy.js";
import { CoacheeDashboardPolicy } from "../domain/services/CoacheeDashboardPolicy.js";
import { CoacheeService } from "../domain/services/CoacheeService.js";
import { CoachService } from "../domain/services/CoachService.js";
import { EnrollmentPolicy } from "../domain/services/EnrollmentPolicy.js";
import { ProcessWaitingListService } from "../domain/services/ProcessWaitingListService.js";
import { WaitingListPolicy } from "../domain/services/WaitingListPolicy.js";
import { CalendarHealthMonitor } from "../infrastructure/adapters/calendar/CalendarHealthMonitor.js";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";
import { createFCMAdapter } from "../infrastructure/adapters/notifications/FCMNotificationAdapter.js";
import { Aes256GcmEncryptionService } from "../infrastructure/encryption/Aes256GcmEncryptionService.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";
import { PrismaClassRepository } from "../infrastructure/persistence/PrismaClassRepository.js";
import { PrismaCoacheeRepository } from "../infrastructure/persistence/PrismaCoacheeRepository.js";
import { PrismaCoachRepository } from "../infrastructure/persistence/PrismaCoachRepository.js";
import { PrismaDeviceTokenRepository } from "../infrastructure/persistence/PrismaDeviceTokenRepository.js";
import { PrismaEnrollmentRepository } from "../infrastructure/persistence/PrismaEnrollmentRepository.js";
import { PrismaNotificationRepository } from "../infrastructure/persistence/PrismaNotificationRepository.js";
import { PrismaUserRepository } from "../infrastructure/persistence/PrismaUserRepository.js";
import { PrismaWaitingListRepository } from "../infrastructure/persistence/PrismaWaitingListRepository.js";
import { env, resolveCalendarId } from "./env.js";

const prisma = new PrismaClient();

const coacheeRepository = new PrismaCoacheeRepository();
const coacheeService = new CoacheeService(coacheeRepository);

const coachRepository = new PrismaCoachRepository();
const coachService = new CoachService(coachRepository);
const encryptionService = new Aes256GcmEncryptionService(env.COACH_FINANCIAL_ENCRYPTION_KEY);
const auditLogger = new AuditLogger(prisma);

const calendarHealthMonitor = new CalendarHealthMonitor();

const enrollmentPolicy = new EnrollmentPolicy();
const coacheeDashboardPolicy = new CoacheeDashboardPolicy();
const waitingListPolicy = new WaitingListPolicy();

// Domain ports for ProcessWaitingListService
const classRepository = new PrismaClassRepository(prisma);
const waitingListRepository = new PrismaWaitingListRepository(prisma);
const _enrollmentRepository = new PrismaEnrollmentRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const sendNotificationAdapter: NotificationSender = createFCMAdapter() ?? {
  async send() {
    return { succeeded: [], failed: [] };
  },
};

const processWaitingListService = new ProcessWaitingListService(
  classRepository,
  waitingListRepository,
  sendNotificationAdapter,
  userRepository,
);

const calendarId = resolveCalendarId();
let calendarProvider: GoogleCalendarAdapter | null = null;
if (env.GOOGLE_CALENDAR_SA_EMAIL && env.GOOGLE_CALENDAR_SA_KEY_PATH && calendarId) {
  try {
    calendarProvider = new GoogleCalendarAdapter(
      env.GOOGLE_CALENDAR_SA_EMAIL,
      env.GOOGLE_CALENDAR_SA_KEY_PATH,
      calendarId,
      calendarHealthMonitor,
    );
  } catch (error) {
    console.warn("Google Calendar adapter failed to initialize:", (error as Error).message);
  }
}

export const container = {
  prisma,
  coacheeRepository,
  coacheeService,
  createCoachee: new CreateCoachee(coacheeRepository, coacheeService),
  listCoachees: new ListCoachees(coacheeRepository),
  getCoachee: new GetCoachee(coacheeRepository),
  updateCoachee: new UpdateCoachee(coacheeRepository, coacheeService),
  updateCoacheeStatus: new UpdateCoacheeStatus(coacheeRepository),
  updateCoacheeLevel: new UpdateCoacheeLevel(coacheeRepository, auditLogger),
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
  calendarProvider,
  calendarHealthMonitor,
  createTrainingClass: calendarProvider ? new CreateTrainingClass(prisma, calendarProvider) : null,
  updateTrainingClass: calendarProvider ? new UpdateTrainingClass(prisma, calendarProvider) : null,
  cancelTrainingClass: new CancelTrainingClass(
    prisma,
    calendarProvider,
    new ClassCancellationPolicy(),
    auditLogger,
  ),
  cancelRecurringSeries: new CancelRecurringSeries(
    prisma,
    calendarProvider,
    new ClassCancellationPolicy(),
    auditLogger,
  ),
  getAvailableSlots: calendarProvider ? new GetAvailableSlots(prisma, calendarProvider) : null,
  listTrainingClasses: new ListTrainingClasses(prisma),
  getTrainingClass: new GetTrainingClass(prisma),
  getCoacheeDashboard: new GetCoacheeDashboard(prisma, coacheeDashboardPolicy),
  joinTrainingClass: new JoinTrainingClass(prisma, enrollmentPolicy, auditLogger),
  joinWaitingList: new JoinWaitingList(prisma, waitingListPolicy, auditLogger),
  leaveWaitingList: new LeaveWaitingList(prisma, waitingListPolicy, auditLogger),
  listWaitingLists: new ListWaitingLists(prisma, waitingListPolicy),
  cancelEnrollment: new CancelEnrollment(
    prisma,
    enrollmentPolicy,
    auditLogger,
    processWaitingListService,
  ),
  claimWaitingListSpot: new ClaimWaitingListSpot(prisma, auditLogger),
  createBlock: calendarProvider
    ? new CreateBlock(prisma, calendarProvider, new BlockPolicy(), auditLogger)
    : null,
  cancelBlock: new CancelBlock(prisma, calendarProvider, new BlockPolicy(), auditLogger),
  listBlocks: new ListBlocks(prisma),
  registerDeviceToken: new RegisterDeviceToken(new PrismaDeviceTokenRepository()),
  sendNotification: new SendNotification(
    new PrismaNotificationRepository(),
    new PrismaDeviceTokenRepository(),
    sendNotificationAdapter,
  ),
};
