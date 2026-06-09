import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import {
  DEFAULT_CONFIG,
  evaluateContribution,
  explainConfig,
  generateConfig,
  generatedPolicyFiles,
  loadConfigFromFile,
  parseConfig,
  renderResult,
  type RenderFormat,
} from "../engine/index.js";
import { IntakeResultSchema } from "../engine/types.js";
import { loadFixtureBundle } from "../github/fixture-provider.js";
import { parseGitHubReference } from "../github/reference.js";

const formatSchema = z.enum(["markdown", "json", "comment"]).default("json");
const configInputSchema = {
  configPath: z.string().optional(),
  config: z.unknown().optional(),
  mode: z.enum(["advisory", "check", "label", "gate"]).optional(),
};

export function createMcpServer(cwd = process.cwd()): McpServer {
  const server = new McpServer({
    name: "maintainer-intake",
    version: "0.1.0",
  });

  server.registerTool(
    "analyze_pr_intake",
    {
      description:
        "Analyze a pull request intake bundle using the shared deterministic engine.",
      inputSchema: {
        fixturePath: z.string().optional(),
        reference: z.string().optional(),
        format: formatSchema,
        ...configInputSchema,
      },
    },
    async (args) => analyzeTool("pull_request", args, cwd),
  );

  server.registerTool(
    "analyze_issue_intake",
    {
      description:
        "Analyze an issue intake bundle using the shared deterministic engine.",
      inputSchema: {
        fixturePath: z.string().optional(),
        reference: z.string().optional(),
        format: formatSchema,
        ...configInputSchema,
      },
    },
    async (args) => analyzeTool("issue", args, cwd),
  );

  server.registerTool(
    "render_maintainer_packet",
    {
      description:
        "Render an existing intake result as JSON, Markdown, or GitHub comment Markdown.",
      inputSchema: {
        result: z.unknown(),
        format: formatSchema,
      },
    },
    async ({ result, format }) => {
      const parsed = IntakeResultSchema.parse(result);
      return textResult(renderResult(parsed, format));
    },
  );

  server.registerTool(
    "generate_policy_files",
    {
      description:
        "Generate maintainer-intake policy files without writing them.",
      inputSchema: {
        format: z.enum(["yaml", "json"]).default("yaml"),
      },
    },
    async ({ format }) =>
      textResult(JSON.stringify(generatedPolicyFiles(format), null, 2) + "\n"),
  );

  server.registerTool(
    "explain_intake_config",
    {
      description:
        "Explain maintainer-intake configuration defaults or supplied config.",
      inputSchema: {
        configPath: z.string().optional(),
        config: z.unknown().optional(),
      },
    },
    async ({ configPath, config }) => {
      const parsed =
        config !== undefined
          ? parseConfig(config)
          : configPath
            ? await loadConfigFromFile(resolveCwd(cwd, configPath))
            : DEFAULT_CONFIG;
      return textResult(explainConfig(parsed));
    },
  );

  return server;
}

export async function startMcpServer(cwd = process.cwd()): Promise<void> {
  const server = createMcpServer(cwd);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

type AnalyzeToolInput = {
  fixturePath?: string | undefined;
  reference?: string | undefined;
  format: RenderFormat;
  configPath?: string | undefined;
  config?: unknown | undefined;
  mode?: "advisory" | "check" | "label" | "gate" | undefined;
};

async function analyzeTool(
  expectedKind: "pull_request" | "issue",
  args: AnalyzeToolInput,
  cwd: string,
) {
  let config =
    args.config !== undefined
      ? parseConfig(args.config)
      : args.configPath
        ? await loadConfigFromFile(resolveCwd(cwd, args.configPath))
        : DEFAULT_CONFIG;
  if (args.mode) {
    config = parseConfig({ ...config, mode: args.mode });
  }

  if (args.fixturePath) {
    const bundle = await loadFixtureBundle(resolveCwd(cwd, args.fixturePath));
    if (bundle.context.kind !== expectedKind) {
      throw new Error(
        "Fixture kind " +
          bundle.context.kind +
          " does not match requested " +
          expectedKind +
          ".",
      );
    }
    const effectiveConfig = args.mode ? config : (bundle.config ?? config);
    const result = evaluateContribution(bundle.context, effectiveConfig);
    return textResult(renderResult(result, args.format));
  }

  if (!args.reference) {
    throw new Error("Provide reference or fixturePath.");
  }

  parseGitHubReference(args.reference);
  throw new Error(
    "Live GitHub MCP analysis is pending the GitHub provider slice. Use fixturePath for local proof.",
  );
}

function textResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

function resolveCwd(cwd: string, path: string): string {
  return new URL(path, "file://" + cwd.replace(/\/$/, "") + "/").pathname;
}
