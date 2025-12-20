# Check Database Connection Script
# Tests if the database is accessible

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    Write-Host "DATABASE_URL not set. Checking .env file..." -ForegroundColor Yellow
    
    $envFile = Join-Path $PSScriptRoot "..\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        $dbLine = $content | Where-Object { $_ -match "^DATABASE_URL=" }
        if ($dbLine) {
            $DatabaseUrl = $dbLine -replace "^DATABASE_URL=", ""
            Write-Host "Found DATABASE_URL in .env file" -ForegroundColor Green
        }
    }
    
    if (-not $DatabaseUrl) {
        Write-Host "❌ DATABASE_URL not found. Please set it in your .env file." -ForegroundColor Red
        Write-Host "   Example: DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Testing database connection..." -ForegroundColor Cyan
Write-Host "Database URL: $($DatabaseUrl -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "`n❌ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Test connection
try {
    $result = & psql $DatabaseUrl -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Database connection successful!" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
        
        # Check if database exists and has tables
        $tablesResult = & psql $DatabaseUrl -c "\dt" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n📊 Database tables:" -ForegroundColor Cyan
            Write-Host $tablesResult -ForegroundColor Gray
        }
    } else {
        Write-Host "`n❌ Database connection failed!" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host "`nPlease check:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL server is running" -ForegroundColor Yellow
        Write-Host "  2. Database exists" -ForegroundColor Yellow
        Write-Host "  3. DATABASE_URL is correct" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "`n❌ Error connecting to database: $_" -ForegroundColor Red
    exit 1
}

