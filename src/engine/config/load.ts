import { readFile } from "node:fs/promises";
import YAML from "yaml";
import {
  DEFAULT_CONFIG,
  type IntakeConfig,
  ConfigError,
  parseConfig,
} from "./schema.js";

export async function loadConfigFromFile(path: string): Promise<IntakeConfig> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return DEFAULT_CONFIG;
    }
    throw error;
  }

  let value: unknown;
  try {
    value = path.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
  } catch (error) {
    throw new ConfigError(
      "Invalid config syntax in " + path + ": " + (error as Error).message,
    );
  }

  return parseConfig(value);
}

export function explainConfig(config: IntakeConfig): string {
  return [
    "version: " + config.version,
    "mode: " + config.mode,
    "pullRequests.requireLinkedIssue: " +
      config.pullRequests.requireLinkedIssue,
    "pullRequests.requireTestEvidence: " +
      config.pullRequests.requireTestEvidence,
    "pullRequests.largeChangeThreshold: " +
      config.pullRequests.largeChangeThreshold,
    "pullRequests.riskyPaths: " + config.pullRequests.riskyPaths.length,
    "issues.duplicateSearch: " + config.issues.duplicateSearch,
    "labels.ready: " + config.labels.ready,
    "labels.needsEvidence: " + config.labels.needsEvidence,
    "labels.maintainerDecision: " + config.labels.maintainerDecision,
  ].join("\n");
}
