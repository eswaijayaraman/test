# Testing Guide

## Local Verification

1. Open the repository folder in GitHub Codespaces or a local terminal.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the local server:

   ```bash
   bash start_local.sh
   ```

4. Open `http://localhost:8000/`.
5. Verify the app:
   - Loads without JavaScript or module errors
   - Accepts student name, grade, and section
   - Starts the timed drill and updates questions quickly
   - Shows a summary after 10 questions or when time expires
   - Displays weak table analytics

## Unit Test Verification

Run the generator tests and coverage:

```bash
npm test
```

Expected results:
- All tests should pass
- Coverage should include `grade4Gen.js`, `grade5Gen.js`, and `grade6Gen.js`
- The grade-specific generation utilities should return valid `text`, `answer`, and `table` fields

## Catalyst Hosting Checks

- Confirm `index.html` contains the Catalyst SDK tags:
  - `<script src="https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"></script>`
  - `<script src="/__catalyst/sdk/init.js"></script>`
- Confirm `catalyst.json` is configured with:
  - `client.source: '.'`
  - `client.index: 'index.html'`
- Deploy to Zoho Catalyst static hosting and verify the root URL returns HTTP 200.

## Notes

This app is static-first and does not require a backend server in Codespaces. All persistence is designed to use the Catalyst Data Store from the browser.
