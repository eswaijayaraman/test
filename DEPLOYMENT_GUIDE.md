Zoho Catalyst Deployment Checklist
If Observed: HTTP 404 on the live site.

Quick checklist to fix:

Confirm upload: verify index.html and words.json exist in the deployed bundle in the Catalyst console or the CLI upload target.
Confirm hosting root: ensure the static-hosting configuration points to the repository root (or the folder that contains index.html). catalyst.json currently has client.source: "." which is correct if files are at project root.
Index file: ensure the hosting config's index file is index.html (matches catalyst.json.client.index).
Re-deploy full site: re-upload or re-publish the contents of the project folder — missing files cause 404s.
Paths: your index.html uses fetch('./words.json') which is fine for same-directory assets. If Catalyst serves your site under a nested path, verify asset paths or use absolute path appropriate for that host.
CORS / MIME: ensure words.json is served with application/json and not blocked by any platform rules.
Logs: check Catalyst deployment logs and the static hosting file list for errors or ignored files (.gitignore, build scripts may omit files).
Commands to test from your machine:

curl -I https://<your-site-domain>/
curl -I https://<your-site-domain>/words.json
If you'd like, I can prepare a zip of the project ready for upload or generate a short deployment script you can run locally to push the correct files; tell me which you prefer.

Additional: Add Catalyst SDK

Insert these two script tags near the end of index.html before </body>:

 <script src="https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"></script>
 <script src="/__catalyst/sdk/init.js"></script>
Verify init.js is accessible at https://<your-site-domain>/__catalyst/sdk/init.js after deploy (curl -I). If it 404s, Catalyst init will fail.

Redeploy and check browser Console for Catalyst initialization messages and any 404s for /__catalyst/* paths.