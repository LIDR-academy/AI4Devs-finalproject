import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.port, () => {
  console.info(`RoboDock backend listening on http://localhost:${env.port}`);
});
