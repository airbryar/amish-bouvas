// The live site's web address, worked out from the GitHub project the update runs in
// (GITHUB_REPOSITORY, "owner/name"). That way it keeps working if the project is renamed or
// handed to another GitHub account. "siteUrl" in data/league.json overrides it, for example
// with a custom domain. Returns null outside GitHub Actions (local builds).
import fs from "node:fs";

export function siteUrl() {
  try {
    const league = JSON.parse(fs.readFileSync("data/league.json", "utf8"));
    if (league.siteUrl) return String(league.siteUrl).replace(/\/*$/, "/");
  } catch {}
  const [owner, name] = (process.env.GITHUB_REPOSITORY || "").split("/");
  if (!owner || !name) return null;
  const host = `${owner.toLowerCase()}.github.io`;
  return name.toLowerCase() === host ? `https://${host}/` : `https://${host}/${name}/`;
}
