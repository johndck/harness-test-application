// logger.js
// Creates one human-readable log file per execution of the harness.
// Usage:
//   import createLogger from "./logger.js";
//   const logger = createLogger("orchestrator");
//   logger.log("llm_request", { messages, tools: [...] });
//   logger.section("Tool calls");
//   logger.error("tool_failed", err);
//   logger.close({ turns: 5 });

import fs from "node:fs";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");

function timestamp() {
  return new Date().toISOString();
}

function fileTimestamp() {
  return timestamp().replace(/[:.]/g, "-");
}

function prettyPrint(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

/**
 * Create a logger bound to a single log file for this execution.
 * @param {string} prefix - short name for this run, used in the filename
 *   (e.g. "orchestrator" -> logs/orchestrator-2026-09-17T12-00-00-000Z.log)
 */
function createLogger(prefix = "run") {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const filePath = path.join(LOG_DIR, `${prefix}-${fileTimestamp()}.log`);
  const stream = fs.createWriteStream(filePath, { flags: "a" });
  const startTime = Date.now();

  function write(line) {
    stream.write(line + "\n");
  }

  write(`===== Run started: ${timestamp()} =====`);
  write(`Log file: ${filePath}`);
  write("");

  /** Log a labeled event, optionally with a data payload (pretty-printed). */
  function log(event, data) {
    write(`[${timestamp()}] EVENT: ${event}`);
    if (data !== undefined) {
      write(prettyPrint(data));
    }
    write("-".repeat(60));
  }

  /** Insert a visual section break, e.g. logger.section("Turn 3"). */
  function section(title) {
    write("");
    write(`===== ${title} =====`);
  }

  /** Log an error with message + stack trace. */
  function error(event, err) {
    write(`[${timestamp()}] ERROR: ${event}`);
    write(prettyPrint({ message: err?.message, stack: err?.stack }));
    write("-".repeat(60));
  }

  /** Close the log file, writing an optional summary and elapsed time. */
  function close(summary) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    section("Run summary");
    if (summary !== undefined) {
      write(prettyPrint(summary));
    }
    write(`Elapsed: ${elapsed}s`);
    write(`===== Run ended: ${timestamp()} =====`);
    stream.end();
  }

  return { filePath, log, section, error, close };
}

export default createLogger;