Data File Guide
This file explains the app's generic data file format and how to add or switch JSON test files without changing project structure.

Summary

The app loads a JSON data file that must be an array of objects with the shape: { "word": "...", "sentence": "..." }
Default filename used by the app: words.json (configurable in index.html).
Adding a new test file

Create a JSON file in the project root, e.g. animals.json:
[
  { "word": "elephant", "sentence": "The elephant walked slowly." },
  { "word": "tiger", "sentence": "The tiger prowled in the jungle." }
]
Include the file in your commit and deployment bundle so it is accessible at https://<your-site>/<filename>.json.
Using a different data file at runtime

Option A (quick): Rename your file to words.json so the app loads it without code changes.
Option B (edit): Open index.html and change the DATA_FILE constant to your filename, for example:
const DATA_FILE = './animals.json';
Option C (recommended): Add a runtime selector UI that lets users pick a filename; the app already supports a DATA_FILE constant and can be extended to read a query parameter or a selector value.
Verify the file is served after deploy

curl -I https://<your-site-domain>/<your-data-file>.json
Expect HTTP/2 200 and content-type: application/json.

Notes

Keep the JSON schema the same as examples above.
If your hosting serves the site under a subpat