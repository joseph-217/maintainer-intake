import { describe, expect, test } from "vitest";
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
});
