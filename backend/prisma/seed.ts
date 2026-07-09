import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trucks = ["TRUCK-001", "TRUCK-002", "TRUCK-003"];

  for (const code of trucks) {
    await prisma.truck.upsert({
      where: { code },
      update: {},
      create: { code }
    });
  }

  const truck = await prisma.truck.findUniqueOrThrow({
    where: { code: "TRUCK-001" }
  });

  const session = await prisma.unloadSession.upsert({
    where: { code: "UNLOAD-DEMO-001" },
    update: {},
    create: {
      code: "UNLOAD-DEMO-001",
      status: "IN_PROGRESS",
      truckId: truck.id
    }
  });

  const demoCubes = [
    { code: "CUBE-DEMO-001", color: "red" as const, x: 143, y: 323, w: 84, h: 68, confidence: 0.9 },
    { code: "CUBE-DEMO-002", color: "blue" as const, x: 220, y: 300, w: 80, h: 70, confidence: 0.88 },
    { code: "CUBE-DEMO-003", color: "yellow" as const, x: 310, y: 340, w: 76, h: 75, confidence: 0.86 }
  ];

  for (const cube of demoCubes) {
    await prisma.detectedCube.upsert({
      where: {
        sessionId_code: {
          sessionId: session.id,
          code: cube.code
        }
      },
      update: {},
      create: {
        ...cube,
        sessionId: session.id,
        metadata: {
          source: "seed",
          mode: "simulation"
        }
      }
    });
  }

  await prisma.robotAction.upsert({
    where: {
      sessionId_code: {
        sessionId: session.id,
        code: "ACTION-DEMO-001"
      }
    },
    update: {},
    create: {
      code: "ACTION-DEMO-001",
      sessionId: session.id,
      actionType: "PICK_AND_DROP",
      status: "SUCCESS",
      mode: "simulation",
      color: "red",
      metadata: {
        dryRun: true,
        commandPreview: "POSE 32 -204 124 1",
        source: "seed"
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
