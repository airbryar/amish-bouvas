// Fills in missing team pictures from ESPN: each team's ESPN logo is saved to team-pictures/
// as "<team-name>.png", the same naming people use when they upload a picture. Teams that
// already have a picture there are left alone, so uploaded pictures are never replaced.
//
// Run by the Pictures workflow when "from_espn" is on: automatically once after setup (the
// first update someone starts by hand), or any time by hand. It records what it did in
// data/espn-logos.json, which is how the first-run check knows it has already happened.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "team-pictures";
const KINDS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"];
// Same as scripts/make-logos.mjs, so the saved file matches its team
const slug = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const league = JSON.parse(fs.readFileSync("data/league.json", "utf8")).league;
const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${league.season}/segments/0/leagues/${league.id}?view=mTeam`;
const s2 = (process.env.ESPN_S2 || "").trim();
const swid = (process.env.ESPN_SWID || "").trim();
if (!s2 || !swid) {
  console.log("::warning::The ESPN_S2 and ESPN_SWID secrets are needed to get team pictures from ESPN.");
  process.exit(0);
}
const headers = { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; league-site-pictures)", Cookie: `espn_s2=${s2}; SWID=${swid}` };

let teams;
try {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`ESPN answered ${r.status}`);
  teams = (await r.json()).teams || [];
  if (!teams.length) throw new Error("ESPN returned no teams");
} catch (err) {
  // Nothing recorded, so the next update someone starts by hand tries again
  console.log(`::warning::Couldn't read the teams from ESPN (${err.message}). No pictures added.`);
  process.exit(0);
}

const have = new Set(
  fs.readdirSync(SRC)
    .filter((f) => KINDS.includes(path.extname(f).toLowerCase()))
    .map((f) => slug(path.basename(f, path.extname(f))))
);
const record = { checkedAt: new Date().toISOString(), added: [], skipped: [] };

for (const t of teams) {
  const name = (t.name || "").trim();
  const key = slug(name);
  if (!key) { record.skipped.push(`${name || "team " + t.id}: name can't be used as a file name`); continue; }
  if (have.has(key)) { record.skipped.push(`${name}: already has a picture`); continue; }
  if (!t.logo) { record.skipped.push(`${name}: no logo on ESPN`); continue; }
  try {
    const r = await fetch(t.logo, { headers: { "User-Agent": headers["User-Agent"] }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`the picture's site answered ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 10 * 1024 * 1024) throw new Error("the picture is over 10 MB");
    const png = await sharp(buf, { animated: false })
      .rotate()
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(SRC, `${key}.png`), png);
    have.add(key);
    record.added.push(name);
    console.log(`${name}: picture from ESPN`);
  } catch (err) {
    record.skipped.push(`${name}: couldn't use its ESPN logo (${String(err.message).split("\n")[0]})`);
  }
}

fs.writeFileSync("data/espn-logos.json", JSON.stringify(record, null, 2) + "\n");
console.log(`Team pictures from ESPN: ${record.added.length} added, ${record.skipped.length} skipped`);
for (const s of record.skipped) console.log(`  ${s}`);
