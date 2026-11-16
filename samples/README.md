# Sample data (for test builds only)

`espn.json` is made-up league data in the same shape as `data/espn.json`, so the full site can
be built and checked without ESPN access (for example in an AI coding sandbox):

1. Copy `samples/espn.json` over `data/espn.json`
2. Run `node scripts/build.mjs` and open `_site/index.html`
3. Put the real file back with `git checkout -- data` before committing

Never commit the sample as `data/espn.json`.
