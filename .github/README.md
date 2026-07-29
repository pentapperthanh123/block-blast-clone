# GitHub Configuration

Thư mục này chứa cấu hình GitHub Actions workflows và automation cho Block Blast project.

## 📋 Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Push/PR đến `master`, `main`, hoặc `develop` branches

**Jobs:**
- **Lint & Type Check**
  - Chạy ESLint để kiểm tra code quality
  - Chạy TypeScript type checking
- **Test**
  - Chạy Jest tests với coverage report
  - Upload coverage đến Codecov (optional)

**Status Badge:**
```markdown
![CI](https://github.com/pentapperthanh123/block-blast-clone/workflows/CI/badge.svg)
```

---

### 2. Security Audit (`security.yml`)

**Trigger:**
- Scheduled: Mỗi thứ 2 hàng tuần lúc 9 AM UTC
- Push đến `master`/`main`
- Manual trigger

**Jobs:**
- Chạy `npm audit` để phát hiện vulnerabilities
- Dry-run `npm audit fix` để xem fixes có sẵn

---

### 3. Build Check (`build.yml`)

**Trigger:** Push/PR đến `master`/`main` hoặc manual

**Jobs:**
- **Build Android Debug APK**
  - Setup Java 17 + Gradle
  - Build debug APK
  - Upload artifact (giữ 7 ngày)
- **Build iOS** (disabled by default)
  - Chỉ enable khi cần test iOS build

**Note:** Build iOS yêu cầu macOS runner và tốn thời gian, nên mặc định bị disable.

---

## 🤖 Dependabot

File `dependabot.yml` tự động tạo PRs để update:
- **NPM dependencies:** Hàng tuần (thứ 2)
- **GitHub Actions:** Hàng tháng

---

## 📝 PR Template

Pull Request template (`PULL_REQUEST_TEMPLATE.md`) cung cấp structure chuẩn cho mọi PR:
- Mô tả thay đổi
- Loại thay đổi (bug fix, feature, refactor, etc.)
- Screenshots nếu có UI changes
- Checklist (lint, test, type-check)
- Test plan

---

## 🚀 Setup Instructions

### 1. Enable Workflows

Workflows sẽ tự động chạy sau khi push lên GitHub. Không cần config gì thêm.

### 2. Optional: Codecov Integration

Nếu muốn track test coverage:

1. Đăng ký tài khoản tại [codecov.io](https://codecov.io)
2. Add repo `block-blast-clone` vào Codecov
3. Copy Codecov token
4. Thêm secret vào GitHub repo:
   - Settings → Secrets → New repository secret
   - Name: `CODECOV_TOKEN`
   - Value: `<your-codecov-token>`

### 3. Branch Protection (Recommended)

Để enforce CI pass trước khi merge:

1. Repo Settings → Branches → Add rule
2. Branch name pattern: `main` hoặc `master`
3. Enable:
   - ✅ Require status checks to pass before merging
   - Select: `Lint & Type Check`, `Run Tests`
   - ✅ Require branches to be up to date before merging

---

## 🔧 Customization

### Thay đổi trigger branches

Edit `on.push.branches` và `on.pull_request.branches` trong workflow files.

### Thay đổi Node version

Edit `node-version` trong `setup-node` step (hiện tại: `18`).

### Enable iOS build

Set `if: false` → `if: true` trong `build-ios` job của `build.yml`.

### Thêm workflow mới

Tạo file `.yml` mới trong `.github/workflows/` với cấu trúc tương tự.

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [React Native CI/CD Guide](https://reactnative.dev/docs/ci-cd)
