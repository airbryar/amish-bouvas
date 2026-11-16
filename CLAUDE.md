# League site: notes for Claude

This repository is the website for **The Amish Bouvas Fantasy League** ("Amish Bouvas",
"ABFL"), a 12-team ESPN fantasy football league with a weekly median game; the top 6 make
the playoffs. ESPN league ID 147882, season 2026. It's hosted on GitHub Pages from this repo,
at `https://<owner>.github.io/<repo>/` (the address follows whichever GitHub account owns
the repo).

It started in Nov 2026 as a copy of another league's site (the "BBFC"), set up by a friend
and handed over. Some internal names still start with `bbfc` (saved-setting keys such as
`bbfc-theme` and `bbfc-my-team`, the offline cache name, `window.__bbfc*`). They're
invisible to visitors. Leave them: renaming the saved-setting keys would reset everyone's
choices.

## Who you're working with

The league manager owns this repo. Unless he says otherwise, assume he isn't a developer:

- Do the work yourself. Don't hand him terminal commands or code to run.
- Explain in plain words. Mention files or code only when he asks.
- For visual changes, show a preview first (a screenshot at iPhone size, 390px wide, in
  light and dark mode), then build it once he picks.
- After publishing, confirm it's live. Be honest if you couldn't check it visually.
- Keep replies short.
- **Never ask for the ESPN codes in chat.** They live only in GitHub secrets.

### His preferences

(None recorded yet. Add them here as he states them.)

## Setup status

README.md walks him through setup: the `ESPN_S2` and `ESPN_SWID` secrets, then GitHub Pages
with Source set to **GitHub Actions**. Until both are done, every workflow ends early with
a "Not set up yet" notice instead of failing. If the site shows "almost ready," ESPN couldn't
be read: the secrets are missing, mistyped or expired (ESPN answering 401 means expired;
he has to replace them himself).

## Settings (`data/league.json`)

| Key | What it does |
| --- | --- |
| `name`, `shortName`, `abbrev` | Full name (page titles, footer), short name (masthead, Home Screen label), abbreviation (built-in seal, page labels). `build.mjs` fills `__NAME__`, `__SHORT__`, `__ABBR__` and `__NAMES__` (JSON for scripts) in every page. |
| `league.id`, `league.season` | The ESPN league. **Change `season` each year** when the new ESPN season starts. |
| `weights` | Power-ranking weights (record, scoring, form, schedule) and `formWeeks`. |
| `takes` | Optional one-line takes per team, shown in Power Rankings. |
| `podcastFeed` | A podcast RSS feed (e.g. SoundCloud's). Empty hides the Podcast section and its bottom-bar button. |
| `onesignalAppId` | Phone alerts through OneSignal. Empty hides the Alerts settings and sends nothing. |
| `tradeFaab` | FAAB dollars in trades, which ESPN doesn't record: `{ "player": "...", "from": "team that sent the player", "amount": 3 }`. |
| `liveEveryMinute` | `false` stops the once-a-minute updates during games (the 5-minute schedule remains). |
| `newWeekOnWednesday` | Defaults to on: on Tuesdays the pages keep showing last week's final scores. `false` turns it off. |
| `offlineCopy` | Defaults to on (the Home Screen app opens instantly on weak signal). `false` turns it off. |
| `siteUrl` | Only for a custom domain; otherwise the address is worked out from the repo (`scripts/site-url.mjs`). |

## How the site updates

`.github/workflows/update.yml`, "Update the league site":

0. The `ready` job checks setup (secrets present, Pages turned on) and stops quietly if not.
1. `scripts/fetch-espn.mjs` reads the league with the secrets and writes `data/espn.json`
   (including `seedingRule`, the tiebreaker the playoff odds follow). If ESPN fails, it keeps
   the last good data.
2. `scripts/fetch-lineups.mjs` writes `data/lineups.json` (both lineups for every game this
   week) for the matchup details sheet. `scripts/fetch-trades.mjs` writes `data/trades.json`
   (trades, FAAB left, this week's and last week's pickups); it reads ESPN only when its copy
   is 55+ minutes old. Both have `continue-on-error`.
3. `scripts/fetch-podcast.mjs` reads `podcastFeed`, if set, into `data/pod.json`.
4. `scripts/build.mjs` fills the placeholders in `site/template.html`, `site/team.html` and
   `site/record-book.html` and writes `_site/`. It computes the playoff odds
   (`scripts/odds.mjs`) and power rankings (`scripts/power.mjs`). With no teams in
   `data/espn.json` yet, it publishes a simple "almost ready" page instead.
5. `scripts/notify.mjs` sends alerts (only if OneSignal is set up), the site deploys to
   Pages, and `scripts/check-live.mjs` republishes if Pages silently stopped updating.

When it runs: every 5 minutes during game windows (crons in UTC), hourly otherwise, and on
every push to `main`. During games each run starts the next one about 50 seconds later
(`scripts/next-run.mjs`), so scores refresh about once a minute. Tuesday mornings it also
commits a copy of `data/espn.json`.

Open pages check `data/stamp.json` every 60 seconds and refresh **in place** (no scroll jump):
they swap in the new `<body>` and re-run the page script. Anything the script attaches to
window/document must go through `on()` / `every()`, and timers check `GEN` /
`window.__bbfcGen`, so the old run is switched off. If the page script or styles changed,
it does a full reload instead.

GitHub Pages sometimes stalls ("Deployment failed, try again later"). The workflow retries
once with an empty "Republish the site" commit. If a change doesn't show up, an empty commit
has always fixed it.

Other workflows:

- `history.yml` reads past seasons into `data/history.json` for the Record Book. Daily until
  the first history is saved, then on the 3rd of each month or by hand.
- `newsroom.yml` gathers player scores, trades and history into `data/newsroom.json`
  (Tuesday, Thursday and Saturday mornings, or by hand). Team pages use it for Top Players;
  a Newspaper writer would use it too.
- `pictures.yml` runs when pictures are uploaded to `team-pictures/` or `league-logo/`.

## Making a change

1. Most changes are in `site/template.html`: markup, CSS and the page script in one file.
2. Build with `node scripts/build.mjs`, then check `_site/index.html` in Playwright at 390px
   wide in both themes, with outside network blocked, and look for page errors. Run
   `git checkout -- data` afterwards so local builds don't commit data files.
3. Commit, `git pull --rebase origin main`, and push to `main`. Wait for the "Update the
   league site" run to succeed and the Pages deployment to show `success`.

## The page

Section order: News → Standings → Power Rankings → Scoreboard → Median Watch →
Transactions → Podcast, then the footer. News appears only once there's a Newspaper edition,
and Podcast only once a feed is set (`<!--news-->` / `<!--pod-->` markers, removed by
`build.mjs`); the bottom bar shrinks to fit.

- **Bottom bar:** app-style buttons fixed to the bottom (News, Standings, Scores, Moves,
  Podcast). Each button's `data-for` lists the sections it covers; tapping smooth-scrolls
  with `scrollToSection`.
- **Masthead:** the built-in seal (or uploaded logo), "ABFL · 2026 Season", the short name,
  "Through Week N", a Record Book pill once there's history, and a gear for Settings.
- **Settings sheet:** My team (saved on that phone; tints that team's rows for that viewer
  only, never pre-set), Appearance (Match phone / Light / Dark), Alerts (if set up).
- **Standings:** head-to-head and median split, a "Playoff line · Top 6" divider, and a
  Table / Playoff odds toggle. Odds come from 10,000 simulations of the rest of the regular
  season (median games count, ties follow ESPN's `seedingRule`). "What it takes" lines
  appear when one result this week would settle a team's spot.
- **Power Rankings:** Record 30%, Scoring 35%, Form 20% (last 3 weeks), Schedule 15%, each
  scaled 0–100 and blended; finished weeks only, so they change when a week goes final.
- **Scoreboard:** matchup cards; tapping one opens both lineups ESPN-style with a live win
  chance.
- **Median Watch:** teams sorted by score with bars above/below the median, a cut line
  between 6th and 7th, Current / Projected toggle; tapping a team opens its lineup.
- **Transactions:** trades with points since the trade, a trade-deadline countdown, a
  24-hour trade ticker under the masthead, and the Waiver Wire with FAAB left.
- **Colors:** green means above the median or winning, red means below or losing; don't use
  them as decoration. Light mode is navy and red; dark mode is modeled on the ESPN app.
  Tokens are on `:root` in each page.
- **Fonts** (Google Fonts): Barlow (body), Barlow Condensed (labels, numbers), Saira
  Condensed (headings), Newsreader (Newspaper stories).
- **Phones first:** the league uses phones; many add the site to their Home Screen.

**Team pages** (`team.html?t=<id>`): record, playoff odds, power rank, this week, a
season chart vs. the weekly median, results, remaining schedule, top players, transactions
and the manager's career. **Record Book** (`record-book.html`): champions, all-time
standings, records and head-to-head, from `data/history.json` plus this season. Managers
appear by first name only, and ESPN member IDs must never be saved in this public repo.

## Optional extras (off for now)

- **Podcast:** set `podcastFeed` in `data/league.json` to the show's RSS feed.
- **Alerts:** needs a free OneSignal account (Web push, Custom Code setup, site URL
  `https://<owner>.github.io`). Put the App ID in `onesignalAppId` and have him add the App
  API Key himself as the `ONESIGNAL_API_KEY` secret. Alerts only work from the Home Screen
  icon on iPhone (iOS 16.4+).
- **Newspaper:** a Claude scheduled task that dispatches `newsroom.yml`, writes three stories
  from `data/newsroom.json`, validates them with `node scripts/add-edition.mjs draft.json`
  (exactly 3 stories; kicker ≤ 32 characters, headline 10–90, dek ≤ 170, 3–8 paragraphs and
  250–520 words each) and pushes `data/news.json`. The News section appears with the first
  edition.

## Uploads he does himself

- **Team pictures:** upload to `team-pictures/` on github.com, named after the team (see
  that folder's README). `pictures.yml` makes 128px badges and republishes.
- **League logo:** upload `logo.png` to `league-logo/`. It replaces the built-in seal in the
  header, the browser tab and the Home Screen icon.
