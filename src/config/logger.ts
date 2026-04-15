import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { FsPath } from "../constants/fs-path";
import { LogRotation } from "../constants/log-rotation";
import { WinstonConsoleTimestampFormat } from "../constants/winston-format";
import { env } from "./env";

const logsDir = path.resolve(process.cwd(), FsPath.LogsDir);

if (env.LOG_TO_FILE && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: WinstonConsoleTimestampFormat }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${String(timestamp)} [${level}] ${String(message)}${rest}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: consoleFormat
  })
];

if (env.LOG_TO_FILE) {
  transports.push(
    new DailyRotateFile({
      dirname: logsDir,
      filename: LogRotation.DailyFilePattern,
      datePattern: LogRotation.DatePattern,
      level: env.LOG_LEVEL,
      maxFiles: env.LOG_MAX_FILES,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  );
}

/**
 * Application logger: console always; daily JSON files when `LOG_TO_FILE` is enabled.
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports
});
