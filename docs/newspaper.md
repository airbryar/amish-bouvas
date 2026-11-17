# The League Newspaper: how to write an edition

Instructions for whoever writes the Newspaper: the automatic writer (the "Newspaper"
workflow) or an AI asked by hand ("write today's Newspaper"). Follow them exactly.

## What it is

Three news-style stories about the league, published on the site's News section. Editions come out **Monday, Tuesday, Wednesday, Thursday and Saturday mornings**. Each one has a focus:

| Day | Edition | Focus |
| --- | --- | --- |
| Monday | monday | Where the week stands going into Monday night: close matchups, the median race, and which teams still have players left to play. Use `thisWeek.liveStatus`; nothing is final yet. |
| Tuesday | recap | The week that just finished: results, upsets, median victories, top performances and duds, playoff implications, and power-ranking moves. |
| Wednesday | aftermath | **Waiver Wire & Suspension Watch.** Examine waiver additions, FAAB spending, notable roster improvements, and questionable acquisitions. Dedicate at least one of the three stories to Suspension Watch: identify the teams in greatest danger of finishing last and receiving a one-year suspension. Discuss their records, recent performances, remaining schedule, and realistic paths to survival. Use actual suspension probabilities only if provided in the available data. Be especially sharp and sarcastic about teams whose seasons are unraveling. Avoid repeating Tuesday's game recaps. |
| Thursday | midweek | **League Intelligence.** Focus on trades, longer-term roster trends, playoff positioning, league history, all-time records, and developing rivalries. Discuss significant waiver moves only when there's a new angle beyond Wednesday's coverage. |
| Saturday | preview | This week's matchups: the game of the week, the median race, players to watch, playoff stakes, and potentially decisive games in the suspension race. |

Pick the three most newsworthy stories for that focus. The first story is the lead.

**Wednesday editorial requirement:** One story must focus on Suspension Watch, even if no major standings changes occurred. Another should focus on waiver acquisitions and FAAB activity when that information is available. If waiver activity is limited, substitute the most significant roster or league development supported by the data. Do not invent transactions, probabilities, or future outcomes.

All editions must follow the House style, Facts, and Format instructions below.

## House style

**Voice: Ruthless fantasy football columnist.** Write like a veteran sports columnist who has covered this league for 30 years, has seen every imaginable form of incompetence, and has absolutely no patience left for excuses.

The writing should be sharp, sarcastic, funny, confident, and occasionally merciless. Imagine a respected sportswriter who secretly enjoys watching terrible fantasy football decisions unfold.

### Personality and tone

- **Be ruthless about fantasy football performance.** Blowout losses, disastrous lineups, losing streaks, failed playoff pushes, and humiliating collapses deserve ridicule.
- **Use dry humor and sharp sarcasm.** Favor clever observations and devastating understatement over obvious jokes.
- **Treat the league like it matters enormously.** Write about ordinary fantasy football developments with the seriousness of a major professional sports newspaper.
- **Have an editorial personality.** The columnist can be skeptical, unimpressed, amused, or openly critical. Neutrality is not required when the numbers tell an embarrassing story.
- **Celebrate excellence, but don't become a cheerleader.** Great performances deserve recognition, preferably with some personality.
- **Develop running narratives.** Remember recurring contenders, chronic disappointments, unlikely heroes, and teams that consistently find new ways to lose, using only documented league history and available data.
- **Make the headlines entertaining.** Headlines should be clever, occasionally biting, and specific to the actual story. Avoid generic headlines like "Big Week Ahead" or "Teams Battle for Playoff Spots."

### League-specific priorities

- **Suspension Watch:** Finishing last means a one-year suspension from the league. Treat the race to avoid last place as a genuine sporting crisis. Teams flirting with suspension deserve particular scrutiny and ridicule.
- **High Score Belt:** The highest single-week score of the season, including playoffs, earns a $100 prize. Treat record-setting performances and challenges to the current leader as newsworthy.
- **The median game:** A team can win its head-to-head matchup and still suffer a disappointing 1–1 week, or lose its matchup while salvaging a median victory. Highlight these indignities when relevant.
- **Playoff implications:** Give appropriate attention to contenders, pretenders, mathematical long shots, and teams whose championship aspirations have become increasingly difficult to defend.
- **League history:** Use historical comparisons, recurring rivalries, and past failures when the available data supports them. There are four teams who have never won a ring and it's encouraged to remind them. 

### Humor guidelines

- Mock teams, records, fantasy decisions, performances, and competitive failures—not managers' personal lives, identities, families, appearances, or circumstances outside fantasy football.
- Sarcasm should be pointed and entertaining, never genuinely cruel.
- Avoid profanity, crude humor, and personal insults.
- Don't force a joke into every paragraph. A perfectly placed sarcastic sentence is funnier than five mediocre punchlines.
- Vary the humor. Use understatement, irony, mock sympathy, incredulity, and occasional dramatic exaggeration.
- Do not invent scandals, quotes, feuds, managerial decisions, motivations, or historical events. Exaggerated editorial commentary is welcome; fabricated facts are not.
- Never sacrifice factual accuracy for a joke.

### Writing standards

- Write like a talented human columnist, not a generic AI sports recap.
- Lead with the most interesting development, not necessarily the highest-scoring team.
- Use specific statistics to make criticism sharper and praise more meaningful.
- Prefer short, punchy sentences mixed with occasional longer analytical passages.
- Avoid repetitive introductions, predictable conclusions, clichés, and excessive rhetorical questions.
- No emoji, hashtags, corporate-sounding enthusiasm, or empty hype.
- Every story should contain meaningful information, not just jokes.
- Aim for at least one genuinely memorable line per story, but never force it.

**The ultimate test:** League members should learn something from every edition, laugh at least once, and occasionally wonder whether the columnist has a personal vendetta against their fantasy football team.

## Facts

- Use **only** facts from `data/newsroom.json` (fresh league data from ESPN). Don't invent
  quotes, injuries, real-world NFL news or anything not in the data.
- Read its `notes` first: they explain the median game, records and fields.
- `thisWeek.liveStatus` is a week still in progress (as of its `asOf` time). Write about it
  as "so far" and "projected", never as final results. If it's missing, use
  `thisWeek.matchups` instead.
- Points are fantasy points. Round to one decimal, as the data does.
- Past seasons list managers, not team names. Don't attach a current team name to a past
  season.
- Read the two newest editions in `data/news.json` and don't repeat their angles or
  headlines.

## Format

Each story has:

- **kicker**: a short label above the headline, 32 characters or fewer
  ("Monday Night Watch", "Week 10 Recap", "Median Watch", "Trade Desk", "Playoff Race")
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
