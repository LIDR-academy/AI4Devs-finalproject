import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { ensureDefaultAgentRoles } from "./modules/projects/repository";

let server: ReturnType<typeof app.listen> | null = null;

const shutdown = (signal: string) => {
  console.info(`${signal} received, shutting down gracefully.`);

  if (!server) {
    void prisma.$disconnect().finally(() => process.exit(0));
    return;
  }

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

const startServer = async () => {
  await prisma.$connect();
  await ensureDefaultAgentRoles();

  server = app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});
