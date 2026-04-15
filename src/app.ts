import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { openApiSpec } from "./config/openapi";
import { localeMiddleware } from "./i18n/i18n";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiRoutes } from "./routes";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(cookieParser());
app.use(localeMiddleware);
app.use(
  morgan("combined", {
    stream: {
      write: (line: string) => {
        logger.info(line.trim());
      }
    }
  })
);
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use(apiRoutes);

app.use(errorMiddleware);
