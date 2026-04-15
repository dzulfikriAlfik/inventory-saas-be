/**
 * Jest setup: force test `NODE_ENV` and disable file logging before modules load.
 */
process.env.NODE_ENV = "test";
process.env.LOG_TO_FILE = "false";
