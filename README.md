# The Amish Bouvas Fantasy League

The league's website: standings, playoff odds, power rankings, the weekly scoreboard with
lineups, Median Watch, trades and waiver pickups, team pages and a Record Book of past
seasons. It reads everything from ESPN on its own. During games, scores refresh about once a
minute.

Once it's set up, the site lives at **https://amishbouva.github.io/amish-bouvas/**.
Everyone in the league can add it to their iPhone's Home Screen like an app (in Safari, tap
Share, then **Add to Home Screen**).

## Setup: three steps

You do these once. They take about 10 minutes, and step 1 needs a computer.

### 1. Add your ESPN sign-in codes

ESPN leagues are private, so the site reads the league with two codes from your own ESPN
sign-in. They're stored as GitHub "secrets": hidden, never shown on the site, and nobody
else can see them. Never paste them anywhere else.

**Get the codes (Chrome on a computer):**

1. Go to **fantasy.espn.com** and sign in, if you aren't already.
2. Right-click anywhere on the page and choose **Inspect**.
3. In the panel that opens, click the **Application** tab (if you don't see it, click **»**).
4. On the left, open **Cookies** and click **https://fantasy.espn.com**.
5. Find **espn_s2** in the list and copy its whole value (it's long).
6. Find **SWID** and copy its value, including the curly braces `{ }`.

**Save them here on GitHub:**

1. In this project, click **Settings**, then **Secrets and variables**, then **Actions**.
2. Click **New repository secret**. Name: `ESPN_S2`. Secret: paste the espn_s2 value.
   Click **Add secret**.
3. Click **New repository secret** again. Name: `ESPN_SWID`. Secret: paste the SWID value.
   Click **Add secret**.

If you ever sign out of ESPN everywhere or change your password, the codes can stop working.
Then repeat this step and replace both secrets with the new values (click each one, then
**Update**).

### 2. Turn on publishing

1. In this project, click **Settings**, then **Pages** (on the left).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### 3. Start the first update

1. Click the **Actions** tab.
2. Click **Update the league site** on the left, then **Run workflow**, then the green
   **Run workflow** button.

In a minute or two, the site is live at the address above. From then on it updates by itself:
every minute or so during games and hourly the rest of the week. That first run also brings in
the Record Book (past seasons) and each team's picture from its ESPN logo, a few minutes later.

Until steps 1 and 2 are done, the updates just wait quietly. Nothing breaks.

## Optional extras

- **Team pictures:** each team gets its ESPN logo automatically. To use a different picture
  for a team, upload one to the `team-pictures` folder (see the README there). To pick up new
  ESPN logos later: **Actions** → **Pictures** → **Run workflow**.
- **League logo:** upload one to the `league-logo` folder (see the README there). Until then,
  the site uses a built-in "ABFL" seal.
- **League name:** the names on the site come from `data/league.json` (`name`, `shortName`
  and `abbrev`).
- **League Newspaper:** three stories every Monday, Tuesday, Thursday and Saturday, written by AI
  from your league's data. Your AI can write one whenever you ask, or it can run by itself
  with an OpenAI API key. See [docs/newspaper.md](docs/newspaper.md).
- **Podcast and phone alerts:** the site can do these too. They're off for now. Ask your AI
  to set one up (see below).

## Making changes

The easiest way is to ask an AI assistant that can work on GitHub projects, such as ChatGPT's
Codex or Claude. Connect it to this project and describe what you want in plain words ("make
the colors green and gold," "change the power-rankings formula"). The notes in
[AGENTS.md](AGENTS.md) explain to any AI how the site works. Add your own preferences there as
you go.

A change goes live once it's on the `main` branch. If your AI opens a "pull request," open it
on GitHub and tap **Merge pull request**, then **Confirm merge**.
