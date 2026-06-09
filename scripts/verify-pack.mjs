import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-pack-"));

try {
  const pack = spawnSync("npm", ["pack", "--dry-run"], { encoding: "utf8" });
  process.stdout.write(pack.stdout);
  process.stderr.write(pack.stderr);
  if (pack.status !== 0) process.exit(pack.status ?? 1);

  const forbidden = ["node_modules", ".env", ".git/"];
  for (const item of forbidden) {
    if (pack.stdout.includes(item)) {
      console.error("Forbidden tarball entry matched: " + item);
      process.exit(1);
    }
  }

  console.log(
    "Pack dry-run completed in " +
      temp +
      ". Packed-install smoke runs after build output exists.",
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
