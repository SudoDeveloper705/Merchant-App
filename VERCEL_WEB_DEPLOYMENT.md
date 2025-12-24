# Deploy Web App to Vercel

## Current Situation

- ✅ **API is deployed**: `https://merchant-app-api-2tvr.vercel.app/`
- ❌ **Web app needs separate deployment**

## Solution: Deploy Web App as Separate Project

### Step 1: Create New Vercel Project for Web App

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select your repository: `SudoDeveloper705/Merchant-App`

### Step 2: Configure Project Settings

**Project Name**: `merchant-app-web` (or any name you prefer)

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: 
- Click "Edit" next to Root Directory
- Set to: `apps/web`

**Build Settings**:
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (or leave default)
- **Install Command**: 
  ```
  cd ../.. && npm install && cd apps/web && npm install
  ```

### Step 3: Environment Variables

Add these in **Settings → Environment Variables**:

**For Production:**
```
NEXT_PUBLIC_API_BASE=https://merchant-app-api-2tvr.vercel.app
```

**Note**: The API client automatically appends `/api` to requests, so this should be the base URL without `/api`.

If your API routes are directly at the root (not under `/api`), use:
```
NEXT_PUBLIC_API_BASE=https://merchant-app-api-2tvr.vercel.app/api
```

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

### Step 5: Access Your Web App

After deployment, you'll get a URL like:
- `https://merchant-app-web.vercel.app` (or similar)

This will be your **frontend URL** where you can:
- View the landing page
- Login/Signup
- Access merchant and partner dashboards

## Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web app
cd apps/web

# Deploy
vercel

# Follow prompts:
# - Set root directory to: apps/web
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

## Summary

You need **TWO separate Vercel projects**:

1. **API Project** (already deployed):
   - URL: `https://merchant-app-api-2tvr.vercel.app/`
   - Root: `apps/api` (or root with API routes)

2. **Web Project** (needs deployment):
   - URL: `https://merchant-app-web.vercel.app` (after deployment)
   - Root: `apps/web`
   - Environment: `NEXT_PUBLIC_API_BASE=https://merchant-app-api-2tvr.vercel.app`

## Troubleshooting

If the web app build fails:
1. Make sure Root Directory is set to `apps/web`
2. Check that the install command includes workspace setup
3. Verify environment variables are set
4. Check build logs in Vercel dashboard

