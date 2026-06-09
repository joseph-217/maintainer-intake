export type GitHubContributionReference = {
  owner: string;
  repo: string;
  number: number;
};

const REFERENCE_PATTERN = /^([^\s/#]+)\/([^\s#]+)#(\d+)$/;

export function parseGitHubReference(
  value: string,
): GitHubContributionReference {
  const match = REFERENCE_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error("Expected GitHub reference in OWNER/REPO#NUMBER form.");
  }

  return {
    owner: match[1]!,
    repo: match[2]!,
    number: Number.parseInt(match[3]!, 10),
  };
}
