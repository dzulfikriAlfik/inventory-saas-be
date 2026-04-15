import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

/**
 * HTTP server entry: binds the Express app to `env.PORT`.
 */
app.listen(env.PORT, () => {
  logger.info(`Inventory SaaS API listening on port ${String(env.PORT)}`);
});
