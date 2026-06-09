import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, test } from "vitest";

const REPO_ROOT = process.cwd();

describe("MCP stdio server", () => {
  test("lists and invokes all maintainer-intake tools", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [
        join(REPO_ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
        join(REPO_ROOT, "src", "cli", "index.ts"),
        "mcp",
      ],
      cwd: REPO_ROOT,
      stderr: "pipe",
    });
    const client = new Client({
      name: "maintainer-intake-test",
      version: "0.1.0",
    });

    try {
      await client.connect(transport);
      const listed = await client.listTools();
      const names = listed.tools.map((tool) => tool.name).sort();
      expect(names).toEqual([
        "analyze_issue_intake",
        "analyze_pr_intake",
        "explain_intake_config",
        "generate_policy_files",
        "render_maintainer_packet",
      ]);

      const pr = await client.callTool({
        name: "analyze_pr_intake",
        arguments: {
          fixturePath: "fixtures/github/pr-ready.json",
          format: "json",
        },
      });
      const result = JSON.parse(firstText(pr));
      expect(result.status).toBe("ready_for_review");

      const issue = await client.callTool({
        name: "analyze_issue_intake",
        arguments: {
          fixturePath: "fixtures/github/issue-security-sensitive.json",
          format: "markdown",
        },
      });
      expect(firstText(issue)).toContain("reject_recommended");

      const rendered = await client.callTool({
        name: "render_maintainer_packet",
        arguments: {
          result,
          format: "comment",
        },
      });
      expect(firstText(rendered)).toContain("maintainer-intake:comment:v1");

      const generated = await client.callTool({
        name: "generate_policy_files",
        arguments: {
          format: "json",
        },
      });
      expect(firstText(generated)).toContain(".github/maintainer-intake.json");

      const explained = await client.callTool({
        name: "explain_intake_config",
        arguments: {},
      });
      expect(firstText(explained)).toContain("mode: advisory");
    } finally {
      await client.close();
    }
  });
});

function firstText(result: unknown): string {
  const content = (
    result as { content?: Array<{ type: string; text?: string }> }
  ).content;
  const first = content?.[0];
  return first?.type === "text" ? (first.text ?? "") : "";
}
