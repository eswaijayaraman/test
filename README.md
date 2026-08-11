# Multiplication Tables Test App

A web-based multiplication speed drill app for Grades 4–6, designed to run as a static Zoho Catalyst web client.

## Features

- Grade-based timers and question patterns
- Adaptive question regeneration for missed table families
- Real-time scoring that weights accuracy and speed
- Weak table analytics for targeted remediation
- Optional teacher/admin overview using Zoho Catalyst Data Store
- Static app hosting via Catalyst with client-side persistence

## Files

- `index.html` — application UI and initialization
- `style.css` — responsive layout and visual styling
- `app.js` — core test engine and persistence logic
- `grade4Gen.js`, `grade5Gen.js`, `grade6Gen.js` — grade-specific question generators
- `gradeGenerators.test.js` — unit tests for generation utilities
- `catalyst.json` — Catalyst static hosting configuration
- `package.json` — npm scripts and dev dependency config
- `TESTING.md` — local verification guide
- `SECRET_HANDLING.md` — secret storage guidance

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
bash start_local.sh
```

Open `http://localhost:8000/` in a browser.

Run tests:

```bash
npm test
```

## Zoho Catalyst Deployment

This app is built for Zoho Catalyst static web hosting with browser-side Data Store persistence.

### Manual deployment

1. Confirm `catalyst.json` contains:

```json
{
  "client": {
    "source": ".",
    "index": "index.html"
  }
}
```

2. Deploy the repository contents to Catalyst.
3. Verify the site root returns HTTP 200.
4. Verify `/__catalyst/sdk/init.js` is accessible after deploy.

### GitHub Actions deployment

A workflow is provided at `.github/workflows/deploy.yml`.
It runs on `push` to `main`, installs dependencies, runs unit tests, and posts to the Catalyst deploy endpoint.

Set these repository secrets in GitHub:

- `CATALYST_DEPLOY_URL`
- `CATALYST_AUTH_TOKEN`

### Catalyst SDK tags

The app includes the Catalyst SDK tags required for browser-side Data Store persistence:

- `https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js`
- `/__catalyst/sdk/init.js`

## Notes

- No local API ports are hardcoded.
- All storage logic is designed around Catalyst Data Store and local fallback.
- The app is static-first and should be compatible with modern browsers.
