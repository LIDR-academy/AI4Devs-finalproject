import { CreateCoachee } from "../application/use-cases/CreateCoachee.js";
import { GetCoachee } from "../application/use-cases/GetCoachee.js";
import { ListCoachees } from "../application/use-cases/ListCoachees.js";
import { UpdateCoachee } from "../application/use-cases/UpdateCoachee.js";
import { UpdateCoacheeLevel } from "../application/use-cases/UpdateCoacheeLevel.js";
import { UpdateCoacheeStatus } from "../application/use-cases/UpdateCoacheeStatus.js";
import { CoacheeService } from "../domain/services/CoacheeService.js";
import { PrismaCoacheeRepository } from "../infrastructure/persistence/PrismaCoacheeRepository.js";

const coacheeRepository = new PrismaCoacheeRepository();
const coacheeService = new CoacheeService(coacheeRepository);

export const container = {
  coacheeRepository,
  coacheeService,
  createCoachee: new CreateCoachee(coacheeRepository, coacheeService),
  listCoachees: new ListCoachees(coacheeRepository),
  getCoachee: new GetCoachee(coacheeRepository),
  updateCoachee: new UpdateCoachee(coacheeRepository, coacheeService),
  updateCoacheeStatus: new UpdateCoacheeStatus(coacheeRepository),
  updateCoacheeLevel: new UpdateCoacheeLevel(coacheeRepository),
};
