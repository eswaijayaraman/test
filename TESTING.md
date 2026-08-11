Local Testing Guide
This file explains how to test the app locally before committing and pushing changes.

Why test locally
Confirm the site works before auto-deploy picks it up.
Verify the app loads the data file and the UI behaves correctly.
Catch errors in index.html, JSON data, or paths before deployment.
How to test locally
Option 1: Use the helper script
Open a terminal in the project folder.
Run:
bash start_local.sh
Open http://localhost:8000 in a browser if it does not open automatically.
Use the app and verify:
the page loads without JavaScript errors
the dataset loads successfully
the progress updates while answering questions
custom or preset data file selections work if you change them
Option 2: Use a simple Python server
Open a terminal in the project folder.
Run:
python3 -m http.server 8000
Open http://localhost:8000 in a browser.
What to verify
The app loads at http://localhost:8000
The default data file loads and the quiz starts
If you select a different dataset file, it loads correctly
No 404 errors for the app assets and data file
No JavaScript console errors
Example dataset files
words.json (default)
animals.json (example alternate dataset)
data.json or any other JSON file with the correct shape
Data file format
Your data file should be a JSON array of objects like this:

[
  { "word": "example", "sentence": "This is an example sentence." }
]
After testing
If everything works, commit and push your changes.
If the app fails locally, fix the issue before committing.
