# Starting the Merchant App

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

**API (.env in apps/api/):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-change-in-production
```

**Web (.env.local in apps/web/):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Database Migrations

```bash
# Make sure PostgreSQL is running
# Then run migrations in order:
psql $DATABASE_URL -f apps/api/migrations/001_create_merchants.sql
psql $DATABASE_URL -f apps/api/migrations/002_create_partners.sql
# ... continue for all migrations
```

### 4. Start Servers

**Option 1: Run separately (recommended for development)**

Terminal 1 - API:
```bash
cd apps/api
npm run dev
```

Terminal 2 - Web:
```bash
cd apps/web
npm run dev
```

**Option 2: Run from root**
```bash
# API
npm run dev:api

# Web
npm run dev:web
```

## Server URLs

- **API Server**: http://localhost:3001
- **Web App**: http://localhost:3000

## Health Checks

- API: http://localhost:3001/health
- Web: http://localhost:3000

## Next Steps

1. Set up PostgreSQL database
2. Run migrations
3. Create test merchant/partner accounts
4. Add Stripe API keys (when ready)
5. Start developing!

