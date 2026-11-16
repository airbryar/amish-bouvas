# The League Newspaper: how to write an edition

Instructions for whoever writes the Newspaper: the automatic writer (the "Newspaper"
workflow) or an AI asked by hand ("write today's Newspaper"). Follow them exactly.

## What it is

Three news-style stories about the league, published on the site's News section. Editions
come out **Tuesday, Thursday and Saturday mornings**. Each one has a focus:

| Day | Edition | Focus |
| --- | --- | --- |
| Tuesday | recap | The week that just finished: results, upsets, who won the median game, top performances and duds, what it means for the playoff race, power-ranking moves |
| Thursday | midweek | Trades, waiver pickups and FAAB spending, pickups that paid off, trends, the trade deadline, league history and all-time records |
| Saturday | preview | This week's matchups: the game of the week, the median race, players to watch, playoff stakes |

Pick the three most newsworthy stories for that focus. The first story is the lead.

## House style

**Change this section to fit the league.** It's what sets the voice.

- Tone: a lively local sports section. Specific, numbers-driven and fair. Playful jabs are
  fine; nothing mean-spirited, crude or personal.
- Write about teams and their managers (first names only, as the data gives them).
- Plain words. No hype words like "massive" or "insane", no emoji, no hashtags.
- Every story should teach the reader something they didn't know: a number, a comparison,
  a stake.

## Facts

- Use **only** facts from `data/newsroom.json` (fresh league data from ESPN). Don't invent
  quotes, injuries, real-world NFL news or anything not in the data.
- Read its `notes` first: they explain the median game, records and fields.
- Points are fantasy points. Round to one decimal, as the data does.
- Past seasons list managers, not team names. Don't attach a current team name to a past
  season.
- Read the two newest editions in `data/news.json` and don't repeat their angles or
  headlines.

## Format

Each story has:

- **kicker**: a short label above the headline, 32 characters or fewer
  ("Week 10 Recap", "Median Watch", "Trade Desk", "Waiver Wire", "Playoff Race")
- **headline**: 10 to 90 characters, newspaper style, in normal case
- **dek**: one sentence under the headline, 170 characters or fewer
- **body**: 3 to 8 paragraphs, 250 to 520 words in total, plain text (no markdown or HTML)

## Steps

1. Read `data/newsroom.json` and the two newest editions in `data/news.json`.
2. Write the three stories to `draft.json` in the project's top folder, in this shape:

   ```json
   {
     "stories": [
       { "kicker": "...", "headline": "...", "dek": "...", "body": ["paragraph", "paragraph", "paragraph"] },
       { "kicker": "...", "headline": "...", "dek": "...", "body": ["..."] },
       { "kicker": "...", "headline": "...", "dek": "...", "body": ["..."] }
     ]
   }
   ```

3. Run `node scripts/add-edition.mjs draft.json`. It checks the rules above and adds the
   edition to `data/news.json` (dated today, Eastern time; running it again the same day
   replaces that day's edition). If it lists problems, fix `draft.json` and run it again.
4. Change no other file.
5. **Writing by hand** (an AI asked in chat): delete `draft.json`, commit `data/news.json`
   (as a pull request if that's how changes are made) and give the commissioner the three
   headlines. **The automatic writer** keeps `draft.json`: the workflow checks it again,
   saves the edition and updates the site itself.

The site shows the newest edition on top and keeps the latest six. The News section and its
bottom-bar button appear with the first edition.
