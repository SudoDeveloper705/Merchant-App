# Merchant App - Setup Guide

## Step 1: Start the Servers

Both servers should now be starting. Check their status:

**API Server:** http://localhost:3001/health
**Web Server:** http://localhost:3000

If they're not running, start them manually:

```powershell
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web  
cd apps/web
npm run dev
```

## Step 2: Set Up PostgreSQL Database

### Option A: If PostgreSQL is already installed

1. **Create the database:**
```sql
CREATE DATABASE merchantapp;
```

2. **Update .env file** in `apps/api/.env`:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/merchantapp
```

3. **Check database connection:**
```powershell
cd apps/api
.\scripts\check-database.ps1
```

4. **Run migrations:**
```powershell
cd apps/api
.\scripts\setup-database.ps1
```

### Option B: If PostgreSQL is not installed

1. **Download and install PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create database:**
```sql
CREATE DATABASE merchantapp;
```

3. **Follow Option A steps 2-4**

## Step 3: Verify Setup

### Check API Server
```powershell
# Should return: {"status":"ok",...}
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
```

### Check Web Server
Open browser: http://localhost:3000

### Check Database
```powershell
cd apps/api
.\scripts\check-database.ps1
```

## Step 4: Test the Application

1. **Open the web app:** http://localhost:3000
2. **You should see the login page**
3. **Create test accounts via API** (once database is set up):
   - First create a merchant/partner in the database
   - Then register users via `/api/auth/register/merchant` or `/api/auth/register/partner`

## Step 5: Add Stripe Keys (When Ready)

Edit `apps/api/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

## Troubleshooting

### Servers not starting?
- Check if ports 3000 and 3001 are available
- Check console for error messages
- Verify Node.js is installed: `node --version`

### Database connection errors?
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Test connection: `psql $DATABASE_URL`

### Migration errors?
- Ensure database exists
- Check PostgreSQL user has CREATE privileges
- Run migrations one by one to identify issues

## Quick Commands Reference

```powershell
# Check servers
Invoke-WebRequest -Uri "http://localhost:3001/health"
Invoke-WebRequest -Uri "http://localhost:3000"

# Check database
cd apps/api
.\scripts\check-database.ps1

# Run migrations
cd apps/api
.\scripts\setup-database.ps1

# View API logs
# Check the terminal where you ran: npm run dev:api

# View Web logs  
# Check the terminal where you ran: npm run dev:web
```

