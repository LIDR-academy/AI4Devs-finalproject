import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

const server = app.listen(env.port, () => {
  console.info(`RoboDock backend listening on http://localhost:${env.port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`RoboDock backend could not start: port ${env.port} is already in use.`);
    process.exit(1);
  }

  console.error("RoboDock backend could not start:", error);
  process.exit(1);
});
