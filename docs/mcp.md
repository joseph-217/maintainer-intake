# MCP

Run the published stdio server without a global install:

    npx --yes maintainer-intake@0.1.2 mcp

With a global install:

    maintainer-intake mcp

Generic MCP client configuration:

    {
      "mcpServers": {
        "maintainer-intake": {
          "command": "npx",
          "args": ["--yes", "maintainer-intake@0.1.2", "mcp"]
        }
      }
    }

The server resolves relative config and fixture paths from the MCP process working directory. Set `GITHUB_TOKEN` or `GH_TOKEN` in the client environment for live GitHub references.

Tools:

- analyze_pr_intake
- analyze_issue_intake
- render_maintainer_packet
- generate_policy_files
- explain_intake_config

Fixture example:

    {
      "fixturePath": "fixtures/github/pr-ready.json",
      "format": "json"
    }

Live GitHub references use OWNER/REPO#NUMBER and require GITHUB_TOKEN or GH_TOKEN. MCP diagnostics go to stderr; stdout is reserved for protocol messages.
