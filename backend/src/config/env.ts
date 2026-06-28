import dotenv from "dotenv";

dotenv.config();

const parsePort = (value: string | undefined) => {
  const port = Number(value ?? "3000");
  if (!Number.isInteger(port) || port <= 0) {
    return 3000;
  }
  return port;
};

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
};
