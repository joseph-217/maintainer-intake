import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import {
  extractLinkedIssueNumbers,
  loadConfigFromGitHub,
  normalizeGitHubFile,
} from "../../src/github/octokit-provider.js";
import { parseGitHubReference } from "../../src/github/reference.js";

describe("GitHub provider contracts", () => {
  test("parses GitHub contribution references", () => {
    expect(parseGitHubReference("octo/example#123")).toEqual({
      owner: "octo",
      repo: "example",
      number: 123,
    });
  });

  test("rejects malformed references", () => {
    expect(() => parseGitHubReference("octo/example/pull/123")).toThrow(
      "OWNER/REPO#NUMBER",
    );
  });

  test("extracts linked issue references from body and comment text", () => {
    expect(
      extractLinkedIssueNumbers("Fixes #12, refs #7, and closes #12."),
    ).toEqual([7, 12]);
  });

  test("normalizes renamed, binary, and omitted-patch files", () => {
    expect(
      normalizeGitHubFile({
        filename: "src/new.ts",
        previous_filename: "src/old.ts",
        status: "renamed",
        additions: 3,
        deletions: 1,
        patch: "@@ -1 +1 @@",
      }),
    ).toMatchObject({
      path: "src/new.ts",
      previousPath: "src/old.ts",
      status: "renamed",
      isBinary: false,
      truncated: false,
    });

    expect(
      normalizeGitHubFile({
        filename: "assets/logo.png",
        status: "modified",
        additions: 0,
        deletions: 0,
      }),
    ).toMatchObject({
      isBinary: true,
      truncated: false,
    });

    expect(
      normalizeGitHubFile({
        filename: "src/large.ts",
        status: "modified",
        additions: 4000,
        deletions: 0,
      }),
    ).toMatchObject({
      isBinary: false,
      truncated: true,
    });
  });

  test("loads repository configuration from the default branch", async () => {
    const getContent = vi.fn().mockResolvedValue({
      data: {
        type: "file",
        encoding: "base64",
        content: Buffer.from("version: 1\nmode: gate\n").toString("base64"),
      },
    });
    const octokit = { repos: { getContent } } as unknown as Octokit;
    const config = await loadConfigFromGitHub(
      { owner: "octo", repo: "example" },
      "token",
      ".github/maintainer-intake.yml",
      "main",
      octokit,
    );
    expect(config.mode).toBe("gate");
    expect(getContent).toHaveBeenCalledWith({
      owner: "octo",
      repo: "example",
      path: ".github/maintainer-intake.yml",
      ref: "main",
    });
  });

  test("uses defaults when repository configuration is absent", async () => {
    const octokit = {
      repos: {
        getContent: vi.fn().mockRejectedValue({ status: 404 }),
      },
    } as unknown as Octokit;
    const config = await loadConfigFromGitHub(
      { owner: "octo", repo: "example" },
      "token",
      ".github/maintainer-intake.yml",
      "main",
      octokit,
    );
    expect(config.mode).toBe("advisory");
  });

  test("rejects malformed repository configuration", async () => {
    const octokit = {
      repos: {
        getContent: vi.fn().mockResolvedValue({
          data: {
            type: "file",
            encoding: "base64",
            content: Buffer.from("version: [\n").toString("base64"),
          },
        }),
      },
    } as unknown as Octokit;
    await expect(
      loadConfigFromGitHub(
        { owner: "octo", repo: "example" },
        "token",
        ".github/maintainer-intake.yml",
        "main",
        octokit,
      ),
    ).rejects.toThrow("Invalid config syntax");
  });
});
