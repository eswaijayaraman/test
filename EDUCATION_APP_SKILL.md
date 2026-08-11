Education App Creation Skill Guide
This guide is for building and deploying an education app on Zoho Catalyst. It is written as a skill-style document: first plan the work, then implement it, and finally verify it.

Purpose
Provide a single reference for everyone on the team.
Link project goals, deployment, testing, secrets, and data handling.
Help an AI agent or non-technical teammate follow the right steps.
Plan
1. Define the app
The app is a browser-based spelling quiz.
It uses a static HTML page (index.html) with client-side JavaScript.
It loads a JSON dataset file of words and sentences.
It should support different JSON files for different tests.
It should be expandable: new dataset files, larger datasets, new question types, and improved visual design should be possible without rewriting the architecture.
1.1 Expansion and UX goals
Support larger datasets by making data loading and navigation easy.
Add UI improvements like responsive layout, clearer instructions, progress display, and accessible controls.
Allow future enhancements such as categories, multiple test modes, search/filtering, scoring summaries, and rich styling.
2. Prepare the repository
Use GitHub for source control.
Keep the app files in a simple static site structure.
Add documentation files for setup, testing, deployment, and secrets.
3. Set up deployment
Use Zoho Catalyst static hosting.
Enable auto-deploy from the GitHub branch.
Keep deploy configuration in catalyst.json.
Use GitHub Actions to upload the site bundle if additional automation is needed.
4. Secure secrets
Store deployment tokens and URLs in GitHub Actions secrets.
Never commit secrets to the repository.
Follow the SECRET_HANDLING.md guidelines.
5. Verify locally before commit
Run the app locally using start_local.sh or python3 -m http.server.
Use TESTING.md to confirm the app loads and the data file works.
Make sure custom dataset selections work.
6. Link documents
README.md for project overview and basic run instructions.
TESTING.md for local verification steps.
DATA_FILE_GUIDE.md for creating and using generic JSON test files.
DEPLOYMENT_NOTES.md for Zoho Catalyst troubleshooting.
ZOHO_CATALYST_DEPLOY_GUIDE.md for non-technical/AI deploy flow.
SECRET_HANDLING.md for safe secret management.
Implement
Step 1: Update code
Ensure index.html contains the UI, dataset selector, and Catalyst SDK tags.
Make JSON file loading configurable.
Keep the app self-contained and static.
Step 2: Add support documents
README.md should explain what the app is and how to run it.
TESTING.md should define local smoke tests.
DATA_FILE_GUIDE.md should explain how to add or change test files.
DEPLOYMENT_NOTES.md should describe live host checks and 404 fixes.
ZOHO_CATALYST_DEPLOY_GUIDE.md should describe GitHub/Git/agent deploy flow.
SECRET_HANDLING.md should describe where and how to store deploy secrets.
Step 3: Add automation
Add GitHub Actions workflow in .github/workflows/deploy.yml.
Use repository secrets CATALYST_DEPLOY_URL and CATALYST_AUTH_TOKEN.
Keep the workflow generic so it can deploy any Catalyst static app.
Step 4: Verify the setup
Run the local server and follow TESTING.md.
Check that the selected JSON dataset loads successfully.
If using GitHub Actions, verify the workflow runs on push and uploads the artifact.
Confirm that live site URLs return HTTP 200 after a successful deploy.
Notes for team and AI
Use this file as the master skill plan.
If the task is to commit latest changes, follow README.md and TESTING.md first.
If the task is to deploy, follow ZOHO_CATALYST_DEPLOY_GUIDE.md and SECRET_HANDLING.md.
If the task is to add a new test dataset, follow DATA_FILE_GUIDE.md.
If the task is to expand the app or improve the look and feel, prioritize:
keeping the app structure static and modular,
using larger or multiple JSON datasets,
improving UI layout, colors, and accessibility,
adding new controls only if they are intuitive and useful.
If an AI agent is given a feature request, it should first plan in this master file, then implement in code, and finally verify with TESTING.md.
Typical workflow
Edit code or add a JSON dataset.
Run local test steps from TESTING.md.
Commit changes with git add ., git commit -m "...", git push.
Let auto-deploy pick up the commit.
Verify live site and dataset file access.
File map
index.html — app UI and logic.
catalyst.json — Catalyst static site config.
.github/workflows/deploy.yml — optional deploy automation.
README.md — project overview and quick start.
TESTING.md — local testing checklist.
DATA_FILE_GUIDE.md — data file instructions.
DEPLOYMENT_NOTES.md — live deployment troubleshooting.
ZOHO_CATALYST_DEPLOY_GUIDE.md — non-technical deploy guidance.
SECRET_HANDLING.md — secret storage best practices.