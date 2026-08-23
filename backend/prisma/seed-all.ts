import bcrypt from "bcrypt";
import { PrismaClient, UserRole, UserStatus, ClassType, ClassStatus, ClassTypePreference } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.COACH_FINANCIAL_ENCRYPTION_KEY || "12345678901234567890123456789012";
const GYM_TIMEZONE = "Europe/Madrid";

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY, "utf8"), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Timezone-aware date creation (matches TimeZoneMath.ts)
function formatZoned(
  instant: Date,
  timeZone: string,
  includeWeekday: boolean,
): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(includeWeekday ? { weekday: "short" as const } : {}),
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }
  return parts;
}

function zonedOffsetMs(instant: Date, timeZone: string): number {
  const parts = formatZoned(instant, timeZone, false);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}

function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string = GYM_TIMEZONE,
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));

  const guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  const offsetGuess = zonedOffsetMs(guess, timeZone);
  const adjusted = new Date(guess.getTime() - offsetGuess);
  const offsetAdjusted = zonedOffsetMs(adjusted, timeZone);
  const verified = new Date(adjusted.getTime() - (offsetAdjusted - offsetGuess));
  return verified;
}

function createMadridDate(dateStr: string, hours: number, minutes = 0): Date {
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return zonedDateTimeToUtc(dateStr, time, GYM_TIMEZONE);
}

function addWallClockDays(instant: Date, days: number): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: GYM_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }
  const [years, months, daysOfMonth] = [Number(parts.year), Number(parts.month), Number(parts.day)];
  const time = `${parts.hour}:${parts.minute}`;
  const targetDate = new Date(Date.UTC(years, months - 1, daysOfMonth + days));
  const targetDateStr = targetDate.toISOString().slice(0, 10);
  return zonedDateTimeToUtc(targetDateStr, time, GYM_TIMEZONE);
}

async function main() {
  console.log("Cleaning up existing data...");

  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.securityAuditLog.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.waitingList.deleteMany();
  await prisma.trainingClass.deleteMany();
  await prisma.recurrenceSeries.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
  await prisma.level.deleteMany();

  console.log("Cleanup complete.");

  // ============================================
  // 1. CREATE LEVELS
  // ============================================
  console.log("\nCreating levels...");

  const levels = [
    { name: "Principiante", color: "#4A90D9", sort_order: 1 },
    { name: "Basico", color: "#50C878", sort_order: 2 },
    { name: "Intermedio", color: "#F5A623", sort_order: 3 },
    { name: "Avanzado", color: "#E67E22", sort_order: 4 },
    { name: "Experto", color: "#E74C3C", sort_order: 5 },
  ];

  const levelMap: Record<string, string> = {};
  for (const level of levels) {
    const created = await prisma.level.create({ data: level });
    levelMap[level.name] = created.id;
    console.log(`  ${level.name} (${level.color})`);
  }

  // ============================================
  // 2. CREATE ADMIN USER
  // ============================================
  console.log("\nCreating admin user...");

  const adminPassword = "123456789";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@coacher.com",
      password_hash: adminHash,
      must_change_password: false,
      name: "Admin User",
      phone: "+34 600 000 001",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`  Admin: ${admin.email} / ${adminPassword}`);

  // ============================================
  // 3. CREATE COACH USER
  // ============================================
  console.log("\nCreating coach user...");

  const coachPassword = "123456789";
  const coachHash = await bcrypt.hash(coachPassword, 12);

  const coach = await prisma.user.create({
    data: {
      email: "coach@coacher.com",
      password_hash: coachHash,
      must_change_password: false,
      name: "Coach Trainer",
      phone: "+34 600 000 002",
      role: UserRole.COACH,
      status: UserStatus.ACTIVE,
      specialities: "Fuerza, Resistencia, HIIT",
      bank_account: encrypt("ES91 2100 0418 4502 0005 1332"),
      ssn: encrypt("12345678A"),
      dni: encrypt("12345678A"),
    },
  });
  console.log(`  Coach: ${coach.email} / ${coachPassword}`);

  // ============================================
  // 4. CREATE COACHEE USERS
  // ============================================
  console.log("\nCreating coachee users...");

  const coachees = [
    { email: "coachee1@coacher.com", name: "Ana Garcia", level: "Basico", preference: ClassTypePreference.BOTH, mustChange: false },
    { email: "coachee2@coacher.com", name: "Carlos Lopez", level: "Intermedio", preference: ClassTypePreference.GROUP, mustChange: false },
    { email: "coachee3@coacher.com", name: "Maria Rodriguez", level: "Principiante", preference: ClassTypePreference.INDIVIDUAL, mustChange: false },
    { email: "coachee4@coacher.com", name: "Pedro Martinez", level: "Basico", preference: ClassTypePreference.GROUP, mustChange: false },
    { email: "coachee5@coacher.com", name: "Laura Fernandez", level: "Intermedio", preference: ClassTypePreference.BOTH, mustChange: true },
    { email: "coachee6@coacher.com", name: "Javier Sanchez", level: "Avanzado", preference: ClassTypePreference.INDIVIDUAL, mustChange: true },
    { email: "coachee7@coacher.com", name: "Isabel Torres", level: "Basico", preference: ClassTypePreference.GROUP, mustChange: false },
    { email: "coachee8@coacher.com", name: "Miguel Hernandez", level: "Principiante", preference: ClassTypePreference.BOTH, mustChange: false },
    { email: "coachee9@coacher.com", name: "Sofia Diaz", level: "Intermedio", preference: ClassTypePreference.GROUP, mustChange: true },
    { email: "coachee10@coacher.com", name: "Daniel Moreno", level: "Avanzado", preference: ClassTypePreference.BOTH, mustChange: false },
  ];

  const coacheeIds: string[] = [];
  for (let i = 0; i < coachees.length; i++) {
    const coachee = coachees[i];
    const phone = `+34 600 00${String(i + 1).padStart(2, "0")} 00${String(i + 1).padStart(2, "0")}`;
    const initialPassword = coachee.mustChange ? phone : "123456789";
    const coacheeHash = await bcrypt.hash(initialPassword, 12);

    const created = await prisma.user.create({
      data: {
        email: coachee.email,
        password_hash: coacheeHash,
        must_change_password: coachee.mustChange,
        name: coachee.name,
        phone: phone,
        role: UserRole.COACHEE,
        status: UserStatus.ACTIVE,
        level_id: levelMap[coachee.level],
        class_type_preference: coachee.preference,
      },
    });
    coacheeIds.push(created.id);
    console.log(`  ${coachee.name}: ${coachee.email} / ${initialPassword} (Level: ${coachee.level}, Must change: ${coachee.mustChange ? "YES" : "no"})`);
  }

  // ============================================
  // 5. CREATE CLASSES
  // ============================================
  console.log("\nCreating training classes...");

  // Calculate dates dynamically based on current date
  // Find next Monday from today
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayInMadrid = zonedDateTimeToUtc(todayStr, "12:00", GYM_TIMEZONE);
  const parts = formatZoned(todayInMadrid, GYM_TIMEZONE, true);
  const currentWeekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday ?? "");
  const daysUntilMonday = (1 - currentWeekday + 7) % 7 || 7; // If today is Monday, get next Monday
  const nextMondayDate = addWallClockDays(todayInMadrid, daysUntilMonday);
  const nextMondayStr = nextMondayDate.toISOString().split("T")[0];

  // Calculate all dates for the next week
  const mondayStr = nextMondayStr;
  const tuesdayDate = addWallClockDays(nextMondayDate, 1);
  const tuesdayStr = tuesdayDate.toISOString().split("T")[0];
  const wednesdayDate = addWallClockDays(nextMondayDate, 2);
  const wednesdayStr = wednesdayDate.toISOString().split("T")[0];
  const thursdayDate = addWallClockDays(nextMondayDate, 3);
  const thursdayStr = thursdayDate.toISOString().split("T")[0];
  const fridayDate = addWallClockDays(nextMondayDate, 4);
  const fridayStr = fridayDate.toISOString().split("T")[0];
  const saturdayDate = addWallClockDays(nextMondayDate, 5);
  const saturdayStr = saturdayDate.toISOString().split("T")[0];

  console.log(`  Week starting: ${mondayStr}`);

  // --- 5.1. Recurring Group Class (4 coachees: Ana, Pedro, Isabel, Miguel) ---
  console.log("\n  Creating recurring group class (Mondays 10:00, Basico)...");

  const recurringGroupSeries = await prisma.recurrenceSeries.create({
    data: {
      class_type: ClassType.GROUP,
      level_id: levelMap["Basico"],
      coach_id: coach.id,
      day_of_week: 1, // Monday
      start_time: createMadridDate(mondayStr, 10, 0),
      start_date: createMadridDate(mondayStr, 0, 0),
      created_by: admin.id,
    },
  });

  const recurringGroupInstances: string[] = [];
  for (let i = 0; i < 12; i++) {
    const instanceDate = addWallClockDays(recurringGroupSeries.start_time, i * 7);
    const dateStr = instanceDate.toISOString().split("T")[0];

    const instance = await prisma.trainingClass.create({
      data: {
        class_type: ClassType.GROUP,
        assigned_coach_id: coach.id,
        level_id: levelMap["Basico"],
        start_time: instanceDate,
        duration_minutes: 60,
        status: ClassStatus.ACTIVE,
        description: "Grupo de entrenamiento basico - Fuerza y Resistencia",
        recurrence_series_id: recurringGroupSeries.id,
        created_by: admin.id,
      },
    });
    recurringGroupInstances.push(instance.id);

    if (i === 0) {
      for (const cid of [coacheeIds[0], coacheeIds[3], coacheeIds[6], coacheeIds[7]]) {
        await prisma.classEnrollment.create({ data: { class_id: instance.id, coachee_id: cid } });
      }
      console.log(`    First instance: ${dateStr} - Ana, Pedro, Isabel, Miguel enrolled`);
    }
  }
  console.log(`  Created ${recurringGroupInstances.length} instances of recurring group class`);

  // --- 5.2. Recurring Individual Class (Javier) ---
  console.log("\n  Creating recurring individual class (Wednesdays 11:00, Avanzado)...");

  const recurringIndividualSeries = await prisma.recurrenceSeries.create({
    data: {
      class_type: ClassType.INDIVIDUAL,
      coach_id: coach.id,
      day_of_week: 3, // Wednesday
      start_time: createMadridDate(wednesdayStr, 11, 0),
      start_date: createMadridDate(wednesdayStr, 0, 0),
      created_by: admin.id,
    },
  });

  const recurringIndividualInstances: string[] = [];
  for (let i = 0; i < 12; i++) {
    const instanceDate = addWallClockDays(recurringIndividualSeries.start_time, i * 7);
    const dateStr = instanceDate.toISOString().split("T")[0];

    const instance = await prisma.trainingClass.create({
      data: {
        class_type: ClassType.INDIVIDUAL,
        assigned_coach_id: coach.id,
        start_time: instanceDate,
        duration_minutes: 60,
        status: ClassStatus.ACTIVE,
        description: "Sesion individual de alto rendimiento",
        recurrence_series_id: recurringIndividualSeries.id,
        created_by: admin.id,
      },
    });
    recurringIndividualInstances.push(instance.id);

    if (i === 0) {
      await prisma.classEnrollment.create({ data: { class_id: instance.id, coachee_id: coacheeIds[5] } });
      console.log(`    First instance: ${dateStr} - Javier enrolled`);
    }
  }
  console.log(`  Created ${recurringIndividualInstances.length} instances of recurring individual class`);

  // --- 5.3. Group class with waiting list (Tuesday 18:00, Intermedio) ---
  console.log("\n  Creating group class with waiting list (Tuesdays 18:00, Intermedio)...");

  const waitlistClassDate = createMadridDate(tuesdayStr, 18, 0);
  const waitlistClass = await prisma.trainingClass.create({
    data: {
      class_type: ClassType.GROUP,
      assigned_coach_id: coach.id,
      level_id: levelMap["Intermedio"],
      start_time: waitlistClassDate,
      duration_minutes: 60,
      status: ClassStatus.ACTIVE,
      description: "Clase grupal intermedia - cardio y tonificacion",
      created_by: admin.id,
    },
  });

  // Enroll 4 coachees (max capacity)
  for (const cid of [coacheeIds[1], coacheeIds[4], coacheeIds[8], coacheeIds[9]]) {
    await prisma.classEnrollment.create({ data: { class_id: waitlistClass.id, coachee_id: cid } });
  }
  // Add 2 to waiting list
  for (const cid of [coacheeIds[0], coacheeIds[3]]) {
    await prisma.waitingList.create({ data: { class_id: waitlistClass.id, coachee_id: cid } });
  }
  console.log(`  Waitlist class: Carlos, Laura, Sofia, Daniel enrolled; Ana, Pedro on waiting list`);

  // --- 5.4. Available group class (Thursday 9:00, Principiante) ---
  console.log("\n  Creating available group class (Thursdays 9:00, Principiante)...");

  const availableClassDate = createMadridDate(thursdayStr, 9, 0);
  const availableClass = await prisma.trainingClass.create({
    data: {
      class_type: ClassType.GROUP,
      assigned_coach_id: coach.id,
      level_id: levelMap["Principiante"],
      start_time: availableClassDate,
      duration_minutes: 60,
      status: ClassStatus.ACTIVE,
      description: "Clase grupal para principiantes - introduccion al fitness",
      created_by: admin.id,
    },
  });
  // Only 1 coachee enrolled (2 spots open)
  await prisma.classEnrollment.create({ data: { class_id: availableClass.id, coachee_id: coacheeIds[2] } });
  console.log(`  Available class: Maria enrolled (2 spots open)`);

  // --- 5.5. Group class with description, Friday 17:00, Basico ---
  console.log("\n  Creating group class with notes (Fridays 17:00, Basico)...");

  const fridayClassDate = createMadridDate(fridayStr, 17, 0);
  const fridayClass = await prisma.trainingClass.create({
    data: {
      class_type: ClassType.GROUP,
      assigned_coach_id: coach.id,
      level_id: levelMap["Basico"],
      start_time: fridayClassDate,
      duration_minutes: 60,
      status: ClassStatus.ACTIVE,
      description: "Sesion de viernes - trabajo funcional. Traer colchoneta y botella de agua.",
      created_by: admin.id,
    },
  });
  // 3 coachees enrolled (1 spot open)
  for (const cid of [coacheeIds[0], coacheeIds[6], coacheeIds[7]]) {
    await prisma.classEnrollment.create({ data: { class_id: fridayClass.id, coachee_id: cid } });
  }
  console.log(`  Friday class: Ana, Isabel, Miguel enrolled (1 spot open)`);

  // --- 5.6. Upcoming individual class (Saturday 10:00) ---
  console.log("\n  Creating upcoming individual class (Saturday 10:00)...");

  const saturdayClassDate = createMadridDate(saturdayStr, 10, 0);
  const saturdayClass = await prisma.trainingClass.create({
    data: {
      class_type: ClassType.INDIVIDUAL,
      assigned_coach_id: coach.id,
      start_time: saturdayClassDate,
      duration_minutes: 60,
      status: ClassStatus.ACTIVE,
      description: "Sesion individual - preparacion fisica general",
      created_by: admin.id,
    },
  });
  await prisma.classEnrollment.create({ data: { class_id: saturdayClass.id, coachee_id: coacheeIds[3] } });
  console.log(`  Saturday individual class: Pedro enrolled`);

  // --- 5.7. Canceled class (for demonstrating canceled status) ---
  console.log("\n  Creating canceled class...");

  const canceledClassDate = createMadridDate(wednesdayStr, 16, 0);
  await prisma.trainingClass.create({
    data: {
      class_type: ClassType.GROUP,
      assigned_coach_id: coach.id,
      level_id: levelMap["Experto"],
      start_time: canceledClassDate,
      duration_minutes: 60,
      status: ClassStatus.CANCELED,
      description: "Clase cancelada - coach indisponible",
      created_by: admin.id,
    },
  });
  console.log(`  Canceled class created`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n\n========================================");
  console.log("SEED COMPLETE - SUMMARY");
  console.log("========================================\n");

  console.log("USERS:");
  console.log("  Admin:  admin@coacher.com / 123456789");
  console.log("  Coach:  coach@coacher.com / 123456789");
  console.log("  Coachees:");
  for (let i = 0; i < coachees.length; i++) {
    const c = coachees[i];
    const initialPw = c.mustChange ? `PHONE (see phone field)` : "123456789";
    console.log(`    ${c.name}: ${c.email} / ${initialPw} [Level: ${c.level}, Pref: ${c.preference}${c.mustChange ? ", MUST CHANGE PASSWORD" : ""}]`);
  }

  console.log("\nCLASSES:");
  console.log("  1. Recurring Group (Mondays 10:00, Basico): Ana, Pedro, Isabel, Miguel enrolled");
  console.log("  2. Recurring Individual (Wednesdays 11:00, Avanzado): Javier enrolled");
  console.log("  3. Group with Waiting List (Tuesday 18:00, Intermedio): Carlos, Laura, Sofia, Daniel enrolled; Ana, Pedro waitlisted");
  console.log("  4. Available Group (Thursday 9:00, Principiante): Maria enrolled (2 spots open)");
  console.log("  5. Group with Notes (Friday 17:00, Basico): Ana, Isabel, Miguel enrolled (1 spot open)");
  console.log("  6. Upcoming Individual (Saturday 10:00): Pedro enrolled");
  console.log("  7. Canceled Group (Wednesday 16:00, Experto): Canceled");

  console.log("\nLEVELS: Principiante, Basico, Intermedio, Avanzado, Experto");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
