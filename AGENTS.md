# League site: notes for AI assistants

These are the working notes for any AI assistant maintaining this site (ChatGPT/Codex,
Claude or another). Read them before changing anything. `CLAUDE.md` just points here.

This repository is the website for **The Amish Bouvas Fantasy League** ("Amish Bouvas",
"ABFL"), a 12-team ESPN fantasy football league with a weekly median game; the top 6 make
the playoffs. ESPN league ID 147882, season 2026. It's hosted on GitHub Pages from this repo,
at `https://<owner>.github.io/<repo>/` (the address follows whichever GitHub account owns
the repo): owned by GitHub user `amishbouva`, so the live site is
`https://amishbouva.github.io/amish-bouvas/`.

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

(None recorded yet. Add them here as he states them, in the same commit as the change.)

### How changes reach the live site

Only what's on the `main` branch is published. Any push or merged pull request to `main`
starts "Update the league site", and the change is live a couple of minutes later. If you
work through pull requests (Codex does), tell him plainly that he needs to merge it (on
github.com: open the pull request, tap **Merge pull request**, then **Confirm merge**), and
keep each pull request to one change so it's easy to undo with **Revert**.

Bots commit to `main` often (`data/pod.json`, `data/alerts-sent.json`, `data/history.json`,
`data/newsroom.json`, the Tuesday copy of `data/espn.json`, pictures). **Don't edit those
generated files by hand or include them in a change**, or merges will conflict. Generated,
never hand-edited: `data/espn.json`, `data/trades.json`, `data/lineups.json`,
`data/pod.json`, `data/alerts-sent.json`, `data/history.json`, `data/newsroom.json`,
`data/logos.json`, `data/brand.json`, `data/espn-logos.json`, `site/logos/`, `site/brand/`,
`site/icons/`. Hand-edited: `data/league.json` and `data/news.json` (Newspaper editions).

### What only he can do

Things an AI can't do for him, so walk him through them step by step: accept the repo
transfer; add or replace GitHub secrets (`ESPN_S2`, `ESPN_SWID`, `ONESIGNAL_API_KEY`,
`OPENAI_API_KEY`);
change repo Settings (Pages, collaborators); merge pull requests; run a workflow by hand
(Actions tab → pick the workflow → **Run workflow**); upload pictures on github.com; sign up
for outside services (OneSignal). Never ask him to paste a secret into chat or into a file.

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
- `newspaper.yml` writes Newspaper editions automatically once he adds an OpenAI API key
  (see Optional extras).
- `pictures.yml` runs when pictures are uploaded to `team-pictures/` or `league-logo/`.
  Started by hand (Actions → Pictures → Run workflow, "fill in from ESPN" ticked by default)
  it also saves each team's ESPN logo as its picture where none was uploaded
  (`scripts/import-espn-logos.mjs`).
- First setup: the first update he starts by hand (or the first push) also starts
  `history.yml` and the ESPN picture import, once each (until `data/history.json` and
  `data/espn-logos.json` exist).

## Making a change

1. Most changes are in `site/template.html`: markup, CSS and the page script in one file.
   Team pages are `site/team.html`, the Record Book `site/record-book.html`.
2. Test build: the repo's `data/espn.json` may be the empty placeholder (the real one lives
   on the live site, and a copy is committed on Tuesdays), so copy `samples/espn.json` over
   it (made-up teams, see `samples/README.md`), run `node scripts/build.mjs`, and check
   `_site/index.html` and `_site/team.html?t=1`. The build needs only Node, no packages or
   internet. If you can run a browser (Playwright), look at it 390px wide in both themes
   with outside network blocked and check for page errors; if you can't, say so and have
   him check on his phone after merging.
3. Run `git checkout -- data` so test data is never committed.
4. Commit to `main` (or open a pull request for him to merge). Afterwards, check the
   "Update the league site" run succeeded (Actions tab) and the change is live.

Scripts that need sharp (`make-logos.mjs`, `make-brand.mjs`, `import-espn-logos.mjs`) run in
the Pictures workflow, which installs it; you don't need them for normal changes.

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

## Optional extras (off for now; set up only when he asks)

- **Podcast:** set `podcastFeed` in `data/league.json` to the show's RSS feed.
- **Alerts:** needs a free OneSignal account (Web push, Custom Code setup, site URL
  `https://<owner>.github.io`). Put the App ID in `onesignalAppId` and have him add the App
  API Key himself as the `ONESIGNAL_API_KEY` secret. Alerts only work from the Home Screen
  icon on iPhone (iOS 16.4+).
- **Newspaper:** three stories per edition, Tuesday (recap), Thursday (midweek) and Saturday
  (preview). **`docs/newspaper.md` is the writer's rulebook** (focus by day, house style,
  facts, format, steps); follow it whenever you write an edition, and edit its House style
  section when he asks for a different voice. Two ways to run it:
  - **Automatic:** `.github/workflows/newspaper.yml` runs Codex (`openai/codex-action`) on
    that schedule with his OpenAI API key (`OPENAI_API_KEY` secret, billed by OpenAI apart
    from ChatGPT). The `write` job (read-only) produces `draft.json`; the `publish` job
    checks it with `scripts/add-edition.mjs`, commits `data/news.json` and updates the site.
    No key, or February–August, means scheduled runs end quietly. Run it by hand from
    Actions → Newspaper (choose recap, midweek or preview, or auto).
  - **On request:** he asks his AI to write today's edition; follow `docs/newspaper.md`
    (`data/newsroom.json` is refreshed Tue/Thu/Sat by `newsroom.yml`, or run that by hand).
  The News section appears with the first edition.

## Pictures

- **Team pictures** come from each team's ESPN logo automatically after setup. To use a
  different picture, he uploads it to `team-pictures/` on github.com, named after the team in
  lowercase with dashes (`Big Game Hunters` → `big-game-hunters.jpg`; see that folder's
  README, which lists every team's file name after the first picture run). Uploading a file
  with the same name as an ESPN one (`.png`) replaces it: delete the old one first or use the
  same name and extension. `pictures.yml` makes 128px badges and republishes. If a team
  renames itself on ESPN, its picture must be renamed to match (or run Pictures by hand to
  fetch the logo under the new name).
- **League logo:** he uploads `logo.png` to `league-logo/`. It replaces the built-in seal in
  the header, the browser tab and the Home Screen icon. ESPN leagues don't have a league
  logo to import. Without one, the seal shows the `abbrev`; its default icons in
  `site/icons/default/` were drawn with "ABFL", so redraw them if the abbreviation changes.

## Every new season

1. When ESPN opens the new season, change `league.season` in `data/league.json`.
2. GitHub turns off scheduled workflows in a public repo after 60 days without activity.
   If the Actions tab shows "This scheduled workflow is disabled," he taps **Enable workflow**
   on each one (Update the league site, Refresh league history, Newsroom data).
3. The Record Book picks up the finished season by itself (`history.yml` on the 3rd of the
   month), or run "Refresh league history" by hand.

## Troubleshooting

- **Site says "almost ready"** or stopped updating: ESPN couldn't be read. Check the latest
  "Update the league site" run's log. "secrets aren't set" → he adds them; ESPN answering
  401 → the codes expired, he replaces both secrets (README step 1).
- **A change doesn't show up:** check the run for that commit in the Actions tab. If it
  succeeded but the site didn't change, Pages stalled: push an empty commit.
- **Runs end with "Not set up yet":** setup isn't finished (secrets or Pages).
- **A team picture doesn't appear:** the file name doesn't match the team name; the
  Pictures run's log says which file was skipped and why.
