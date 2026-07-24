# 🔒 Branch Protection Setup Guide

## 📋 Quick Setup Checklist

Bạn đang ở GitHub Settings → Rulesets. Follow these steps:

---

## 🎯 Setup for `master` Branch (Production)

### 1. Create Ruleset

**Ruleset Name:** `Protect master (production)`

### 2. Enforcement Status
- ✅ **Active** (not Disabled or Evaluate)

### 3. Target Branches
Click **"Add target"** → **"Include by pattern"**
- Pattern: `master`

### 4. Bypass List
- Leave empty (hoặc add yourself nếu cần bypass trong emergency)

### 5. Rules (Enable these)

#### ✅ Required Rules:

**Require status checks to pass before merging**
- ✅ Enable
- Add required checks (sẽ xuất hiện sau first CI run):
  - `Lint & Type Check`
  - `Run Tests`
- ✅ Require branches to be up to date before merging

**Require pull request before merging**
- ✅ Enable
- Required approvals: `1` (nếu làm một mình thì set 0)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require approval of the most recent reviewable push

**Block force pushes**
- ✅ Enable

**Restrict deletions**
- ✅ Enable

---

## 🛠️ Setup for `dev` Branch (Development)

### 1. Create Ruleset

**Ruleset Name:** `Protect dev (development)`

### 2. Enforcement Status
- ✅ **Active**

### 3. Target Branches
Click **"Add target"** → **"Include by pattern"**
- Pattern: `dev`

### 4. Bypass List
- Add yourself (để có thể commit small fixes directly nếu cần)

### 5. Rules (Enable these)

#### ✅ Required Rules:

**Require status checks to pass before merging**
- ✅ Enable
- Required checks:
  - `Lint & Type Check`
  - `Run Tests`
- ✅ Require branches to be up to date

**Block force pushes**
- ✅ Enable

**Note:** Không require PR cho `dev` - cho phép direct commits cho small fixes

---

## 📸 Step-by-Step với Screenshots

### Step 1: Navigate to Rulesets
1. Go to your repo: https://github.com/pentapperthanh123/block-blast-clone
2. Click **Settings** tab
3. Sidebar → **Rules** → **Rulesets**
4. Click **"New branch ruleset"**

### Step 2: Configure Master Ruleset
```yaml
Name: Protect master (production)
Enforcement: Active
Target: master

Rules:
✅ Require status checks
  └── Lint & Type Check
  └── Run Tests
✅ Require pull requests (1 approval)
✅ Block force pushes
✅ Restrict deletions
```

### Step 3: Configure Dev Ruleset
```yaml
Name: Protect dev (development)
Enforcement: Active
Target: dev
Bypass: pentapperthanh123

Rules:
✅ Require status checks
  └── Lint & Type Check
  └── Run Tests
✅ Block force pushes
```

### Step 4: Save Rulesets
Click **"Create"** button for each ruleset

---

## ⚙️ Advanced Options (Optional)

### Require Linear History
- ✅ Enable (forces rebase instead of merge commits)
- Pros: Clean linear history
- Cons: More complex for beginners

### Require Deployments to Succeed
- ⏸️ Skip for now
- Use when you have automated deployments

### Require Signed Commits
- ⏸️ Optional
- Adds extra security but requires GPG setup

---

## 🧪 Testing Protection Rules

### Test Master Protection:

```bash
# Try to push directly to master (should fail)
git checkout master
echo "test" >> test.txt
git add test.txt
git commit -m "test direct push"
git push origin master
# Expected: ❌ Rejected by branch protection

# Correct way: Create PR
git checkout -b test-pr
git push -u origin test-pr
# Then create PR on GitHub: master ← test-pr
```

### Test Dev Protection:

```bash
# Direct push to dev (should work if you're in bypass list)
git checkout dev
echo "small fix" >> README.md
git add README.md
git commit -m "docs: small update"
git push origin dev
# Expected: ✅ Success (if bypassed) or ❌ (if not bypassed)
```

---

## 🚨 What Happens After Setup?

### For Master Branch:
1. ❌ Cannot push directly
2. ✅ Must create PR from `dev` or `hotfix/*`
3. ⏳ CI must pass (lint, type-check, tests)
4. 👥 Must have 1 approval (if required)
5. ✅ Then can merge

### For Dev Branch:
1. ⚠️ Can push directly if bypassed (small fixes)
2. ✅ Can merge from `feature/*` branches
3. ⏳ CI must pass for PRs
4. ✅ More flexible than master

---

## 📊 After First CI Run

Sau khi CI workflows chạy lần đầu, bạn có thể add required status checks:

1. Edit each ruleset
2. Scroll to **"Require status checks to pass"**
3. Click **"Add checks"**
4. Select from dropdown:
   - `Lint & Type Check`
   - `Run Tests`
   - `Build Check` (optional)

---

## 🔧 Troubleshooting

### "Status checks not showing up"
- ✅ Push một commit để trigger CI
- ✅ Wait for CI to complete
- ✅ Refresh ruleset settings page

### "Can't push to protected branch"
- ✅ Check if you're in bypass list
- ✅ Create PR instead of direct push
- ✅ Verify CI passed

### "PR can't be merged"
- ✅ Check CI status (must be green)
- ✅ Ensure branch is up to date
- ✅ Get required approvals

---

## 📚 Best Practices

1. **Always create feature branches** from `dev`
2. **Test locally** before pushing
3. **Keep PRs small** (easier to review)
4. **Write descriptive** commit messages
5. **Update branch** before creating PR
6. **Don't force push** to protected branches
7. **Use bypass sparingly** (emergencies only)

---

## 🎯 Quick Reference

| Action | Master | Dev | Feature |
|--------|--------|-----|---------|
| Direct push | ❌ | ⚠️ | ✅ |
| Force push | ❌ | ❌ | ✅ |
| Delete | ❌ | ⚠️ | ✅ |
| PR required | ✅ | ⏸️ | N/A |
| CI required | ✅ | ✅ | ⏸️ |
| Review required | ✅ | ❌ | ❌ |

Legend:
- ✅ Yes / Allowed
- ❌ No / Blocked
- ⚠️ Conditional (bypass)
- ⏸️ Optional
- N/A Not applicable

---

Made with 🔒 for secure development workflows
