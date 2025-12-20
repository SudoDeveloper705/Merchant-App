# Quick Start Guide

## ✅ Current Status

- ✅ Dependencies installed
- ✅ Web server running on http://localhost:3000
- ⏳ API server starting (may need database)

## 🚀 Next Steps

### 1. Set Up PostgreSQL Database

**If PostgreSQL is installed:**
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE merchantapp;"

# Update apps/api/.env with your connection string:
# DATABASE_URL=postgresql://username:password@localhost:5432/merchantapp
```

**If PostgreSQL is NOT installed:**
- Download: https://www.postgresql.org/download/windows/
- Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

### 2. Run Database Migrations

```powershell
cd apps/api
.\scripts\setup-database.ps1
```

Or manually:
```powershell
# Set DATABASE_URL first
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/merchantapp"

# Run migrations
cd apps/api/migrations
Get-ChildItem *.sql | Sort-Object Name | ForEach-Object {
    Write-Host "Running $_..."
    psql $env:DATABASE_URL -f $_.FullName
}
```

### 3. Verify Setup

**Check API:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

**Check Web:**
Open browser: http://localhost:3000

**Check Database:**
```powershell
cd apps/api
.\scripts\check-database.ps1
```

### 4. Test the Application

1. Open http://localhost:3000
2. You should see the login page
3. Create test accounts (after database is set up)

### 5. Add Stripe Keys (Optional - Later)

When ready to test Stripe integration, add to `apps/api/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📝 Server Commands

**Start API:**
```powershell
cd apps/api
npm run dev
```

**Start Web:**
```powershell
cd apps/web
npm run dev
```

**Or from root:**
```powershell
npm run dev:api    # Terminal 1
npm run dev:web    # Terminal 2
```

## 🔍 Troubleshooting

**API not starting?**
- Check if port 3001 is available
- Verify DATABASE_URL in .env
- Check terminal for error messages

**Database connection errors?**
- Ensure PostgreSQL is running
- Verify DATABASE_URL format
- Test: `psql $DATABASE_URL -c "SELECT 1;"`

**Web not loading?**
- Check if port 3000 is available
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check browser console for errors

