import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFile = `.env.${nodeEnv}`;
config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default("1d"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  FRONTEND_URL: z.string().url(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  LOG_TO_FILE: z.enum(["true", "false"]).optional(),
  LOG_MAX_FILES: z.string().default("14d")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

const logToFile =
  parsed.data.LOG_TO_FILE === "true"
    ? true
    : parsed.data.LOG_TO_FILE === "false"
      ? false
      : parsed.data.NODE_ENV !== "test";

/**
 * Validated process environment for the active `NODE_ENV` (loaded from `.env.<NODE_ENV>`).
 */
export const env = {
  ...parsed.data,
  LOG_TO_FILE: logToFile
};
