PropertyFlow multi-page app
===========================

Files:
- index.html   -> Marketplace
- agent.html   -> Agent portal
- admin.html   -> Admin panel
- styles.css   -> Shared design system
- app.js       -> Shared data + interactions
- vendor/supabase.js -> Browser Supabase SDK bundle

Setup:
- Run `npm install` if you want to use the Node test scripts or helper modules.
- Open `index.html` in a browser to start the front-end app.

Test scripts:
- `signupTest.js` and `createPropertyTest.js` read credentials from `SUPABASE_TEST_EMAIL` and `SUPABASE_TEST_PASSWORD`.
- Copy `.env.example` into your preferred local env setup, but do not commit real credentials.
