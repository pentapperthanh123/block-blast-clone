# 🌿 Git Workflow Strategy - Block Blast Clone

## 📋 Branch Structure

```
master (production)
  ↑
  └── dev (development)
       ↑
       └── feature/xxx (feature branches)
```

---

## 🌲 Branch Overview

### `dev` - Development Branch 🛠️ ⭐ **DEFAULT**
- **Purpose:** Integration branch for active development
- **Status:** ⭐ **Default branch** of the repository
- **Deployment:** Automatically deploys to staging/dev environment (future)
- **Protection:** ✅ Requires CI checks passing
- **Merge from:** Feature branches
- **Direct commits:** ⚠️ Allowed for small fixes (discouraged)
- **Note:** All new PRs target this branch by default

### `master` - Production Branch 🚀
- **Purpose:** Stable, production-ready code
- **Deployment:** Automatically deploys to production (future)
- **Protection:** ✅ Requires PR reviews + CI checks passing
- **Merge from:** `dev` branch only (via PR)
- **Direct commits:** ❌ Forbidden

### `feature/*` - Feature Branches 💡
- **Purpose:** Individual features, bug fixes, improvements
- **Naming:** `feature/game-engine`, `feature/skia-rendering`, `fix/type-errors`
- **Base:** Created from `dev`
- **Merge to:** `dev` (via PR)
- **Lifetime:** Short-lived (delete after merge)

---

## 🔄 Development Workflow

### 1️⃣ Starting a New Feature

```bash
# Ensure you're on dev and up to date
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature
# ... make changes ...

# Commit your work
git add .
git commit -m "feat: implement your feature"

# Push to remote
git push -u origin feature/your-feature-name
```

### 2️⃣ Creating a Pull Request

**Target:** `dev` branch

1. Push your feature branch
2. Go to GitHub → Pull Requests → New PR
3. Base: `dev` ← Compare: `feature/your-feature-name`
4. Fill in PR template:
   - Description
   - Type of change
   - Test plan
   - Screenshots (if UI)
5. Wait for CI checks to pass ✅
6. Request review (if working with team)
7. Merge when approved + CI green

### 3️⃣ Releasing to Production

**From `dev` to `master`**

```bash
# Ensure dev is stable and tested
git checkout dev
git pull origin dev

# Create release PR
# Go to GitHub → New PR
# Base: master ← Compare: dev
```

**Release PR Checklist:**
- ✅ All features tested on dev
- ✅ CI checks passing
- ✅ Version bumped in `package.json`
- ✅ CHANGELOG updated (future)
- ✅ No breaking changes (or documented)

---

## 🎯 Workflow Diagram

```
Developer A          Developer B          Developer C
    |                    |                     |
    └─→ feature/a        └─→ feature/b         └─→ feature/c
            ↓                    ↓                   ↓
         (test)              (test)              (test)
            ↓                    ↓                   ↓
            └────────────────────┴───────────────────┘
                              ↓
                          [PR to dev]
                              ↓
                          CI Checks ✅
                              ↓
                            [dev]
                              ↓
                       (staging deploy)
                              ↓
                      [Test on dev env]
                              ↓
                        [PR to master]
                              ↓
                          CI Checks ✅
                              ↓
                          [master]
                              ↓
                     (production deploy)
```

---

## 🚦 Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding tests
- **chore:** Maintenance tasks (deps, config)
- **perf:** Performance improvements

### Examples
```bash
feat(engine): implement matrix collision detection
fix(ui): correct button alignment on mobile
docs(readme): update setup instructions
test(constants): add unit tests for scoring system
chore(deps): upgrade react-native to 0.74.5
```

---

## 🔒 Branch Protection Rules

### Master Branch (Production)
```yaml
✅ Require pull request reviews (1 approval)
✅ Require status checks to pass
   - Lint & Type Check
   - Run Tests
   - Build Check (Android)
✅ Require branches to be up to date
✅ Block force pushes
✅ Restrict deletions
```

### Dev Branch (Development)
```yaml
✅ Require status checks to pass
   - Lint & Type Check
   - Run Tests
✅ Block force pushes
⚠️ Direct commits allowed (small fixes only)
```

---

## 🛠️ Common Commands

### Sync with dev
```bash
git checkout dev
git pull origin dev
git checkout your-feature-branch
git merge dev
# Or: git rebase dev (if no conflicts)
```

### Update feature branch
```bash
git checkout feature/your-feature
git fetch origin
git rebase origin/dev
git push --force-with-lease origin feature/your-feature
```

### Clean up merged branches
```bash
# Delete local merged branches
git branch --merged | grep -v "master\|dev" | xargs git branch -d

# Delete remote merged branches (GitHub auto-deletes on merge)
git fetch --prune
```

### Hotfix on production
```bash
# For urgent production fixes
git checkout master
git pull origin master
git checkout -b hotfix/critical-bug
# ... fix the bug ...
git push -u origin hotfix/critical-bug
# Create PR: master ← hotfix/critical-bug
# After merge, sync back to dev:
git checkout dev
git merge master
git push origin dev
```

---

## 🎨 Feature Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<name>` | `feature/game-board` |
| Bug Fix | `fix/<name>` | `fix/score-calculation` |
| Refactor | `refactor/<name>` | `refactor/state-management` |
| Hotfix | `hotfix/<name>` | `hotfix/crash-on-launch` |
| Experiment | `experiment/<name>` | `experiment/new-ui` |
| Docs | `docs/<name>` | `docs/api-reference` |

---

## 📊 CI/CD Integration

### Automated Checks (All branches)
- ✅ ESLint (code quality)
- ✅ TypeScript type checking
- ✅ Jest unit tests
- ✅ Security audit (weekly + on push)
- ✅ Android build check (master + dev)

### Future: Automated Deployments
- **`dev` → staging.blockblast.com** (auto-deploy on push)
- **`master` → blockblast.com** (auto-deploy on push)
- Expo OTA updates for mobile

---

## 🐛 Troubleshooting

### Merge conflicts
```bash
# Start merge/rebase
git merge dev
# Fix conflicts in editor
git add <resolved-files>
git commit
```

### Reset to remote
```bash
# Discard local changes and sync with remote
git fetch origin
git reset --hard origin/dev
```

### Recover deleted branch
```bash
# Find commit SHA
git reflog
# Recreate branch
git checkout -b feature/recovered <commit-sha>
```

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)

---

**Remember:** 
- Always work on feature branches
- Keep `dev` stable and testable
- Keep `master` production-ready
- Write clear commit messages
- Test before merging

Made with ❤️ for clean Git workflows
