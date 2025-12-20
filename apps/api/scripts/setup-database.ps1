# Database Setup Script for Merchant App
# Run this script to set up the database and run migrations

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    Write-Host "DATABASE_URL not set. Please set it in your .env file or as an environment variable." -ForegroundColor Red
    Write-Host "Example: DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp" -ForegroundColor Yellow
    exit 1
}

Write-Host "Setting up database..." -ForegroundColor Cyan
Write-Host "Database URL: $DatabaseUrl" -ForegroundColor Gray

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "`n❌ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ PostgreSQL client found" -ForegroundColor Green

# Get migration files
$migrationDir = Join-Path $PSScriptRoot "..\migrations"
$migrations = Get-ChildItem -Path $migrationDir -Filter "*.sql" | Sort-Object Name

Write-Host "`nFound $($migrations.Count) migration files" -ForegroundColor Cyan

# Run migrations
$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    Write-Host "`nRunning: $($migration.Name)..." -ForegroundColor Yellow
    
    try {
        $result = & psql $DatabaseUrl -f $migration.FullName 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Success: $($migration.Name)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Failed: $($migration.Name)" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ Error running $($migration.Name): $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n=== Migration Summary ===" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($failCount -eq 0) {
    Write-Host "`n🎉 Database setup complete!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some migrations failed. Please check the errors above." -ForegroundColor Yellow
}

