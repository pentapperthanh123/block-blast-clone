# 🤖 Dependabot Cleanup Guide

## 🚨 Issue: 11 Open PRs với Conflicts

**Vấn đề:** Dependabot đã tạo 11 PRs trước khi setup branch strategy. Tất cả đều bị conflicts vì base branch (`dev`) đã thay đổi.

**Giải pháp:** Close tất cả PRs cũ và để Dependabot recreate với config mới.

---

## 🔧 Solution: Close Old PRs

### Option A: Close via GitHub UI (Recommended)

1. Go to: https://github.com/pentapperthanh123/block-blast-clone/pulls
2. For each Dependabot PR:
   - Click vào PR
   - Scroll xuống
   - Click **"Close pull request"**
   - Add comment: `Closing to allow Dependabot to recreate with updated base branch`

### Option B: Close via GitHub CLI (Faster)

```bash
# Install GitHub CLI nếu chưa có
# https://cli.github.com/

# Login
gh auth login

# List all open Dependabot PRs
gh pr list --author app/dependabot

# Close all Dependabot PRs
gh pr list --author app/dependabot --json number --jq '.[].number' | \
  xargs -I {} gh pr close {} -c "Closing to allow Dependabot to recreate with updated base branch"
```

### Option C: Close via API Script

```powershell
# PowerShell script to close all Dependabot PRs
$repo = "pentapperthanh123/block-blast-clone"
$token = "YOUR_GITHUB_TOKEN"

# Get all open PRs
$prs = gh api repos/$repo/pulls --jq '.[] | select(.user.login=="dependabot[bot]") | .number'

# Close each PR
foreach ($pr in $prs) {
  gh pr close $pr -c "Closing to allow Dependabot to recreate with updated base branch"
  Write-Host "Closed PR #$pr"
}
```

---

## ✅ After Closing PRs

### 1. Updated Dependabot Config

File `.github/dependabot.yml` đã được update:

```yaml
# NPM dependencies → target dev branch
target-branch: "dev"

# GitHub Actions → target master branch  
target-branch: "master"
```

**Rationale:**
- NPM deps go to `dev` first (test before production)
- GitHub Actions updates go to `master` (infrastructure changes)

### 2. Trigger New PRs

Dependabot sẽ tự động tạo PRs mới theo schedule:
- **NPM:** Every Monday
- **GitHub Actions:** Monthly

**Manual trigger (optional):**
1. Go to: https://github.com/pentapperthanh123/block-blast-clone/network/updates
2. Click **"Check for updates"** button

---

## 📋 Expected Behavior After Cleanup

### Before:
```
❌ 11 PRs targeting dev (created before branch strategy)
❌ All have merge conflicts
❌ Based on old commit history
```

### After:
```
✅ Fresh PRs with correct base branches
✅ No conflicts
✅ Properly grouped updates
✅ Following new branch strategy
```

---

## 🎯 Future Workflow

### NPM Dependency Updates

```
1. Dependabot creates PR → dev
2. CI runs automatically
3. Review + test on dev environment
4. Merge to dev
5. When ready, create PR: master ← dev
6. Deploy to production
```

### GitHub Actions Updates

```
1. Dependabot creates PR → master
2. CI runs automatically
3. Review changes
4. Merge to master
5. Sync to dev: git checkout dev && git merge master
```

---

## 🔍 Verify Setup

### Check Current PRs
```bash
gh pr list
```

### Check Dependabot Status
```bash
# View Dependabot alerts
gh api repos/pentapperthanh123/block-blast-clone/dependabot/alerts

# View Dependabot secrets
gh secret list
```

### Verify Config
```bash
cat .github/dependabot.yml
```

---

## 🚨 If Issues Persist

### Dependabot Not Creating New PRs

**Possible causes:**
1. No updates available
2. `open-pull-requests-limit` reached
3. Base branch doesn't exist
4. Dependabot disabled

**Debug:**
```bash
# Check repo settings
gh api repos/pentapperthanh123/block-blast-clone/vulnerability-alerts

# Enable Dependabot
gh api -X PUT repos/pentapperthanh123/block-blast-clone/vulnerability-alerts
```

### PRs Still Have Conflicts

**Solution:**
1. Ensure base branch (`dev` or `master`) is up to date
2. Close and let Dependabot recreate
3. Or manually merge base into PR:
   ```bash
   gh pr checkout <PR_NUMBER>
   git merge origin/dev
   git push
   ```

---

## 📚 Resources

- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub CLI](https://cli.github.com/)

---

## ✅ Checklist

- [ ] Close all 11 old Dependabot PRs
- [ ] Commit updated `dependabot.yml`
- [ ] Push changes to master and dev
- [ ] Wait for Dependabot to create new PRs (Monday for NPM)
- [ ] Verify new PRs target correct branches
- [ ] Setup branch protection rules (if not done yet)

---

Made with 🤖 for clean dependency management
