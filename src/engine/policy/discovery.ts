import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { IntakeConfig } from "../config/schema.js";

export type PolicyFileState = {
  path: string;
  required: boolean;
  present: boolean;
  bytes?: number;
};

export type PolicyDiscoveryReport = {
  files: PolicyFileState[];
  issueForms: string[];
  missingRequired: string[];
  missingOptional: string[];
};

export async function discoverPolicyFiles(
  cwd: string,
  config: IntakeConfig,
): Promise<PolicyDiscoveryReport> {
  const paths = uniquePaths(
    config.policy.requiredFiles.concat(config.policy.optionalFiles),
  );
  const required = new Set(config.policy.requiredFiles);
  const files: PolicyFileState[] = [];

  for (const path of paths) {
    const absolute = resolve(cwd, path);
    try {
      const info = await stat(absolute);
      const file: PolicyFileState = {
        path,
        required: required.has(path),
        present: info.isFile(),
      };
      if (info.isFile()) file.bytes = info.size;
      files.push(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      files.push({
        path,
        required: required.has(path),
        present: false,
      });
    }
  }

  const issueForms = await listIssueForms(
    resolve(cwd, config.policy.issueTemplateDirectory),
    config.policy.issueTemplateDirectory,
  );
  const missingRequired = files
    .filter((file) => file.required && !file.present)
    .map((file) => file.path);
  const missingOptional = files
    .filter((file) => !file.required && !file.present)
    .map((file) => file.path);

  return {
    files,
    issueForms,
    missingRequired,
    missingOptional,
  };
}

export async function readPolicyFile(
  cwd: string,
  path: string,
): Promise<string | undefined> {
  try {
    return await readFile(resolve(cwd, path), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

async function listIssueForms(
  absoluteDirectory: string,
  displayDirectory: string,
): Promise<string[]> {
  try {
    const entries = await readdir(absoluteDirectory, {
      withFileTypes: true,
    });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => displayDirectory + "/" + entry.name)
      .filter((path) => /\.(ya?ml|md)$/i.test(path))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
