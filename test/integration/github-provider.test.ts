import { describe, expect, test } from "vitest";
import {
  extractLinkedIssueNumbers,
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
});
