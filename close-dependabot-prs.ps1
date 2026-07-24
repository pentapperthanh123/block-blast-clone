# PowerShell script to close all Dependabot PRs
# Prerequisites: GitHub CLI installed (https://cli.github.com/)

Write-Host "🤖 Closing Dependabot PRs..." -ForegroundColor Cyan

# Check if gh is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found!" -ForegroundColor Red
    Write-Host "Install: winget install --id GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# Check authentication
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

$repo = "pentapperthanh123/block-blast-clone"

# Get all open Dependabot PRs
Write-Host "📋 Fetching open Dependabot PRs..." -ForegroundColor Yellow
$prs = gh pr list --repo $repo --author "app/dependabot" --json number,title --limit 100 | ConvertFrom-Json

if ($prs.Count -eq 0) {
    Write-Host "✅ No open Dependabot PRs found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($prs.Count) Dependabot PRs to close:" -ForegroundColor Yellow
$prs | ForEach-Object { Write-Host "  #$($_.number): $($_.title)" }

# Confirm
$confirm = Read-Host "`nClose all $($prs.Count) PRs? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 0
}

# Close each PR
$closed = 0
foreach ($pr in $prs) {
    Write-Host "Closing PR #$($pr.number)..." -ForegroundColor Cyan
    gh pr close $pr.number --repo $repo --comment "Closing to allow Dependabot to recreate with updated base branch (dev/master strategy)"
    if ($LASTEXITCODE -eq 0) {
        $closed++
        Write-Host "  ✅ Closed PR #$($pr.number)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to close PR #$($pr.number)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Closed $closed/$($prs.Count) PRs" -ForegroundColor Green
Write-Host "🔄 Dependabot will recreate PRs based on new config" -ForegroundColor Cyan
