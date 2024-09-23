import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import activityRoutes from "./routes/activityRoutes";
import tripRoutes from "./routes/tripRoutes";
import ikigooAssistantRoutes from "./routes/assistantRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/activities", activityRoutes);
app.use("/trips", tripRoutes);
app.use("/chat", ikigooAssistantRoutes);

app.use(errorHandler);

export default app;