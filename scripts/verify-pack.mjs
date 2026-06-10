import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-pack-"));
let tarball;

try {
  const dryRun = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
  });
  process.stdout.write(dryRun.stdout);
  process.stderr.write(dryRun.stderr);
  if (dryRun.status !== 0) process.exit(dryRun.status ?? 1);

  const dryRunInfo = JSON.parse(dryRun.stdout)[0];
  const entries = dryRunInfo.files.map((file) => file.path);
  const forbidden = [
    "node_modules",
    ".env",
    ".git/",
    "artifacts/verification",
    "ACCEPTANCE_MATRIX",
    "APPLICATION",
  ];
  for (const item of forbidden) {
    if (entries.some((entry) => entry.includes(item))) {
      console.error("Forbidden tarball entry matched: " + item);
      process.exit(1);
    }
  }

  const pack = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", temp],
    { encoding: "utf8" },
  );
  process.stdout.write(pack.stdout);
  process.stderr.write(pack.stderr);
  if (pack.status !== 0) process.exit(pack.status ?? 1);
  const packInfo = JSON.parse(pack.stdout)[0];
  tarball = join(temp, packInfo.filename);

  const install = spawnSync("npm", ["install", tarball], {
    cwd: temp,
    encoding: "utf8",
  });
  process.stdout.write(install.stdout);
  process.stderr.write(install.stderr);
  if (install.status !== 0) process.exit(install.status ?? 1);

  const cli = join(
    temp,
    "node_modules",
    ".bin",
    process.platform === "win32"
      ? "maintainer-intake.cmd"
      : "maintainer-intake",
  );
  const version = spawnSync(cli, ["--version"], {
    cwd: temp,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  process.stdout.write(version.stdout);
  process.stderr.write(version.stderr);
  if (version.status !== 0 || version.stdout.trim() !== "0.1.1") {
    process.exit(version.status ?? 1);
  }

  const fixture = join(
    temp,
    "node_modules",
    "maintainer-intake",
    "fixtures",
    "github",
    "pr-ready.json",
  );
  const analyze = spawnSync(
    cli,
    ["analyze-pr", "--fixture", fixture, "--format", "json"],
    {
      cwd: temp,
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );
  process.stdout.write(analyze.stdout);
  process.stderr.write(analyze.stderr);
  if (analyze.status !== 0 || !analyze.stdout.includes("ready_for_review")) {
    process.exit(analyze.status ?? 1);
  }

  console.log("Packed install smoke passed in " + temp + ".");
} finally {
  await rm(temp, { recursive: true, force: true });
  if (tarball) {
    await rm(tarball, { force: true });
  }
}
