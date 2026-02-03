# Branch Protection Configuration

The Brush repository uses a PR-based workflow to ensure code quality.

## Branch Protection Settings

Currently, branch protection is configured via GitHub UI. To set up branch protection:

### Via GitHub Web Interface:

1. Go to **Settings** → **Branches**
2. Click **Add rule** for `main`
3. Enable:
   - **Require status checks** (optional: add tests as required checks)
   - **Require branches to be up to date before merging**
   - **Do not allow bypassing the above settings**
4. Check **Require pull request before merging**:
   - **Require approvals: 1**
5. Uncheck **Allow administrators to bypass** (optional)
6. Save

### API Configuration:

```bash
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1
    },
    "enforce_admins": true,
    "restrictions": {
      "users": [],
      "teams": [],
      "apps": []
    }
  }' \
  https://api.github.com/repos/${GITHUB_REPOSITORY}/branches/main/protection
```

## Workflow Summary

| Branch | Purpose | Protection | Merge To |
|--------|---------|------------|----------|
| `main` | Production | ✅ Protected (PR required) | Direct merges blocked |
| `develop` | Integration | ❌ No protection | Receives feature merges |
| `feature/*` | Feature work | ❌ No protection | Created from develop |
| `bugfix/*` | Bug fixes | ❌ No protection | Created from develop |

## Status Checks

Recommended status checks:
- Unit tests (run on PR)
- Linting (if configured)
- Build verification (future enhancement)

To enable status checks in GitHub Actions, create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd tests
          node unit.test.js
```