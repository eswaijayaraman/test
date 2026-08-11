Secret Handling Guidelines
Purpose

Keep deployment and API credentials safe. This doc explains how to store and use secrets (tokens, URLs) securely for GitHub Actions and Zoho Catalyst.
For non-technical users (quick steps)

Open your GitHub repository in a browser.
Go to Settings → Secrets and variables → Actions.
Click New repository secret and add the following secrets (example names):
CATALYST_DEPLOY_URL (the Catalyst deploy endpoint)
CATALYST_AUTH_TOKEN (Bearer token for deploy)
Do NOT paste tokens into chat, code, or commit messages.
How to use secrets in GitHub Actions

Reference secrets with the secrets context; never hardcode values.
Example (in a workflow):

env:
  CATALYST_DEPLOY_URL: ${{ secrets.CATALYST_DEPLOY_URL }}
  CATALYST_AUTH_TOKEN: ${{ secrets.CATALYST_AUTH_TOKEN }}
Best practices

Least privilege: create tokens with the minimum scope required and limited lifetime.
Rotate regularly: update and replace tokens periodically.
Do not print or log secrets: avoid echo or commands that reveal values in logs.
Use repository environments for protected secrets when possible and require reviewers for deployments.
Use organization secrets for shared credentials and restrict which repositories can access them.
Enable secret scanning and alerts in GitHub to detect accidental exposures.
Restrict who can update GitHub Actions workflows and repository settings via team permissions and branch protection rules.
For automation agents

Provide secrets via the CI environment (secrets) only. The agent should fail if required secrets are missing.
Do not store secrets in plain files inside the repository. If local testing is needed, use a local .env kept out of version control and never upload it.
If a secret is exposed

Revoke the token immediately.
Issue a new token with reduced scope.
Update the GitHub secret value and re-deploy.
Audit commits to ensure the secret is not stored in the repo history (if it is, rotate and remove it using git history rewrite tools).
Checklist for reviewers

Confirm secrets exist in Settings before running workflows.
Confirm workflow references secrets rather than inline values.
Verify deploy logs do not contain secret values.
Contact

If you need help setting secrets, ask a repo administrator to set them for you.