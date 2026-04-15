import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiSpec } from "./config/openapi";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiRoutes } from "./routes";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use(apiRoutes);

app.use(errorMiddleware);
