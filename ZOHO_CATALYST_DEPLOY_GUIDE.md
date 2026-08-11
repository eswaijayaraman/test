ZOHO CATALYST DEPLOY GUIDE (Non-technical / AI-friendly)

Purpose

Step-by-step checklist to create a new GitHub repo for a static Zoho Catalyst app, push code, and verify auto-deploy. Designed so a non-technical teammate or an automation agent can follow it.
Assumptions

You have a GitHub account and a Zoho Catalyst project with static hosting enabled.
Auto-deploy is enabled in Zoho Creator/Catalyst so commits to the selected branch trigger deployments.
The project is a static site (HTML/CSS/JS and optional JSON data files).
Quick checklist (one-liners)

Create repository on GitHub (name: my-app).
Clone repo locally: git clone <repo-url>.
Add app files (example: index.html, catalyst.json, data.json).
Commit and push to main branch.
Verify Catalyst auto-deploy picked the commit.
Confirm site root (/) and data file (e.g., /data.json) return HTTP 200.
Detailed steps (copy/paste)

Create repo on GitHub
Use the GitHub UI to create a new repository (public or private). Copy the HTTPS clone URL.
Clone locally
git clone <HTTPS-URL>
cd <repo-name>
Add files
Minimum files: index.html and catalyst.json.
catalyst.json example:
{
  "client": {
    "source": ".",
    "index": "index.html"
  }
}
Add a JSON data file (default name: words.json or generic data.json). Schema: array of {"word":"...","sentence":"..."}.
Commit & push
git add .
git commit -m "Initial app files"
git push -u origin main
Confirm auto-deploy (Catalyst)
In Zoho Catalyst console, check the Hosting / Deployments page. The latest commit should appear and show status SUCCESS or FAILED.
Verify the live site
Run these checks and expect HTTP 200 for both:
curl -I https://<your-site-domain>/
curl -I https://<your-site-domain>/<your-data-file>.json
If you see 404, follow troubleshooting below.
Optional: Add Catalyst SDK tags to index.html

Insert before </body>:
<script src="https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"></script>
<script src="/__catalyst/sdk/init.js"></script>
Troubleshooting (common fixes for 404)

Files missing in the deployed bundle: Re-upload or ensure auto-deploy included latest commit.
Hosting root misconfigured: confirm client.source points to the folder with index.html (often .).
Index file mismatch: ensure client.index is index.html.
Asset path issues: if site is served under a base path, use absolute paths (e.g., /basepath/data.json).
init.js 404: Catalyst init needs /__catalyst/sdk/init.js to be served — check with curl.
Check Catalyst deployment logs for skipped/ignored files.
How to add a new test/data file (non-technical)

Create a new file in the repo root named e.g. animals.json with the correct JSON structure.
Commit and push:
git add animals.json
git commit -m "Add animals.json test data"
git push
Wait for auto-deploy and verify:
curl -I https://<your-site-domain>/animals.json
If you want automation (AI agent) to perform these steps

The agent must run these shell commands in sequence and check HTTP response codes after deploy.
Commands the agent needs to run:
git clone, git add, git commit, git push
curl -I to verify status codes
If deploy fails, collect the deployment log from Catalyst and report error messages.
Rollback / quick re-deploy

Revert to last working commit locally then push:
git revert <commit-hash>
git push
Or force re-deploy the same commit by re-pushing (use with care):
git commit --allow-empty -m "trigger redeploy"
git push
Contact & next steps

If you want, I can:
Prepare a ready-to-upload zip of the repository,
Add a GitHub Action to automatically call a Catalyst CLI/deploy API (workflow added: .github/workflows/deploy.yml).
Secrets to set in GitHub repo settings -> Secrets: CATALYST_DEPLOY_URL (the Catalyst deploy endpoint) and CATALYST_AUTH_TOKEN (Bearer token).
Implement an in-app runtime selector UI to pick different JSON data files (added to index.html).
Secrets handling

See SECRET_HANDLING.md for safe secret storage and usage instructions. Important points:
Add secrets via GitHub: Settings → Secrets and variables → Actions → New repository secret.
Do not hardcode or commit tokens. Workflows should reference $ {{ secrets.NAME }}.
Rotate tokens and limit their scope. Revoke immediately if exposed.
*** End Guide