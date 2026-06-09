#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Command, CommanderError, Option } from "commander";
import {
  ConfigError,
  DEFAULT_CONFIG,
  evaluateContribution,
  generateConfig,
  generatedPolicyFiles,
  loadConfigFromFile,
  parseConfig,
  renderResult,
  type IntakeConfig,
  type RenderFormat,
} from "../engine/index.js";
import { loadFixtureBundle } from "../github/fixture-provider.js";
import { parseGitHubReference } from "../github/reference.js";

const VERSION = "0.1.0";
const DEFAULT_CONFIG_PATH = ".github/maintainer-intake.yml";

type CliIo = {
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
  cwd: string;
};

export async function runCli(
  argv: string[] = process.argv,
  io: CliIo = defaultIo(),
): Promise<number> {
  let commandExitCode = 0;
  const program = new Command();
  program
    .name("maintainer-intake")
    .description(
      "Deterministic contribution-intake checks for open-source maintainers.",
    )
    .version(VERSION)
    .exitOverride()
    .configureOutput({
      writeOut: (value) => io.stdout.write(value),
      writeErr: (value) => io.stderr.write(value),
    });

  program
    .command("init")
    .description(
      "Generate maintainer-intake policy files. Previews to stdout unless --write is set.",
    )
    .addOption(
      new Option("--format <format>", "output format")
        .choices(["yaml", "json"])
        .default("yaml"),
    )
    .option("--write", "write generated files")
    .action(async (options: { format: "yaml" | "json"; write?: boolean }) => {
      if (options.write) {
        await writePolicyFiles(options.format, io);
      } else {
        io.stdout.write(generateConfig(options.format));
      }
    });

  const policy = program
    .command("policy")
    .description("Inspect maintainer-intake policy files.");
  policy
    .command("doctor")
    .description("Validate config and report actionable policy diagnostics.")
    .option("--config <path>", "config path", DEFAULT_CONFIG_PATH)
    .addOption(
      new Option("--format <format>", "output format")
        .choices(["text", "json"])
        .default("text"),
    )
    .action(async (options: { config: string; format: "text" | "json" }) => {
      await doctorPolicy(options.config, options.format, io);
    });

  program
    .command("analyze-pr [reference]")
    .description(
      "Analyze a pull request by fixture or OWNER/REPO#NUMBER reference.",
    )
    .option("--fixture <path>", "fixture bundle path")
    .option("--config <path>", "config path", DEFAULT_CONFIG_PATH)
    .addOption(
      new Option("--format <format>", "output format")
        .choices(["markdown", "json", "comment"])
        .default("markdown"),
    )
    .addOption(
      new Option("--mode <mode>", "mode override").choices([
        "advisory",
        "check",
        "label",
        "gate",
      ]),
    )
    .action(async (reference: string | undefined, options: AnalyzeOptions) => {
      const exitCode = await analyzeContribution(
        "pull_request",
        reference,
        options,
        io,
      );
      commandExitCode = exitCode;
    });

  program
    .command("analyze-issue [reference]")
    .description("Analyze an issue by fixture or OWNER/REPO#NUMBER reference.")
    .option("--fixture <path>", "fixture bundle path")
    .option("--config <path>", "config path", DEFAULT_CONFIG_PATH)
    .addOption(
      new Option("--format <format>", "output format")
        .choices(["markdown", "json", "comment"])
        .default("markdown"),
    )
    .addOption(
      new Option("--mode <mode>", "mode override").choices([
        "advisory",
        "check",
        "label",
        "gate",
      ]),
    )
    .action(async (reference: string | undefined, options: AnalyzeOptions) => {
      const exitCode = await analyzeContribution(
        "issue",
        reference,
        options,
        io,
      );
      commandExitCode = exitCode;
    });

  program
    .command("mcp")
    .description("Run the maintainer-intake MCP server over stdio.")
    .action(async () => {
      const { startMcpServer } = await import("../mcp/index.js");
      await startMcpServer(io.cwd);
    });

  try {
    await program.parseAsync(argv, { from: "node" });
    return commandExitCode;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    io.stderr.write(formatError(error) + "\n");
    return error instanceof ConfigError ? error.exitCode : 4;
  }
}

type AnalyzeOptions = {
  fixture?: string;
  config: string;
  format: RenderFormat;
  mode?: IntakeConfig["mode"];
};

async function writePolicyFiles(
  format: "yaml" | "json",
  io: CliIo,
): Promise<void> {
  const files = generatedPolicyFiles(format);
  const written: string[] = [];
  const unchanged: string[] = [];

  for (const [path, content] of Object.entries(files)) {
    const absolute = resolve(io.cwd, path);
    let existing: string | undefined;
    try {
      existing = await readFile(absolute, "utf8");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
    }

    if (existing !== undefined && existing !== content) {
      throw new ConfigError("Refusing to overwrite differing file: " + path);
    }
    if (existing === content) {
      unchanged.push(path);
      continue;
    }

    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, content, "utf8");
    written.push(path);
  }

  io.stdout.write(
    JSON.stringify(
      {
        written,
        unchanged,
      },
      null,
      2,
    ) + "\n",
  );
}

async function doctorPolicy(
  path: string,
  format: "text" | "json",
  io: CliIo,
): Promise<void> {
  const absolute = resolve(io.cwd, path);
  const exists = await fileExists(absolute);
  const config = await loadConfigFromFile(absolute);
  const warnings = exists
    ? []
    : [
        "Config file not found; using documented defaults. Run maintainer-intake init --write to create policy files.",
      ];
  const report = {
    valid: true,
    configPath: path,
    mode: config.mode,
    warnings,
  };

  if (format === "json") {
    io.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    io.stdout.write("maintainer-intake policy: valid\n");
    io.stdout.write("config: " + path + "\n");
    io.stdout.write("mode: " + config.mode + "\n");
    for (const warning of warnings) {
      io.stdout.write("warning: " + warning + "\n");
    }
  }
}

async function analyzeContribution(
  expectedKind: "pull_request" | "issue",
  reference: string | undefined,
  options: AnalyzeOptions,
  io: CliIo,
): Promise<number> {
  let config = await loadConfigFromFile(resolve(io.cwd, options.config));
  if (options.mode) {
    config = parseConfig({ ...config, mode: options.mode });
  }

  if (options.fixture) {
    const bundle = await loadFixtureBundle(resolve(io.cwd, options.fixture));
    if (bundle.context.kind !== expectedKind) {
      io.stderr.write(
        "Fixture kind " +
          bundle.context.kind +
          " does not match requested " +
          expectedKind +
          ".\n",
      );
      return 2;
    }
    const effectiveConfig = options.mode ? config : (bundle.config ?? config);
    const result = evaluateContribution(bundle.context, effectiveConfig);
    io.stdout.write(renderResult(result, options.format));
    return result.writePlan.gate.exitCode;
  }

  if (!reference) {
    io.stderr.write("Provide OWNER/REPO#NUMBER or --fixture PATH.\n");
    return 2;
  }

  try {
    parseGitHubReference(reference);
  } catch (error) {
    io.stderr.write(formatError(error) + "\n");
    return 2;
  }

  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    io.stderr.write(
      "Live GitHub analysis requires GITHUB_TOKEN or GH_TOKEN. Fixture mode does not require network credentials.\n",
    );
    return 3;
  }

  io.stderr.write(
    "Live GitHub provider is not implemented in this slice. Use --fixture for local proof.\n",
  );
  return 3;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await readFile(path, "utf8");
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function defaultIo(): CliIo {
  return {
    stdout: process.stdout,
    stderr: process.stderr,
    cwd: process.cwd(),
  };
}

const isEntrypoint =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isEntrypoint) {
  runCli().then((code) => {
    process.exitCode = code;
  });
}
