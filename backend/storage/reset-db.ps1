# PowerShell script to reset the SQLite database
# Use this if you encounter migration errors

Write-Host "🗑️  Resetting SQLite database..." -ForegroundColor Yellow

$dbPath = "database.sqlite"
$dbFullPath = Join-Path $PSScriptRoot $dbPath

if (Test-Path $dbFullPath) {
    Write-Host "  Found database file: $dbFullPath" -ForegroundColor Gray
    Remove-Item $dbFullPath -Force
    Write-Host "  ✅ Database file deleted" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Database file not found, nothing to delete" -ForegroundColor Cyan
}

Write-Host "`n✅ Database reset complete!" -ForegroundColor Green
Write-Host "   You can now run: php storage/migrate.php" -ForegroundColor Gray

