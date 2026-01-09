# Fix: Vercel "No Next.js version detected" Error

## Problem
Vercel is showing the error:
```
Warning: Could not identify Next.js version, ensure it is defined as a project dependency.
Error: No Next.js version detected.
```

## Root Cause
This happens when Vercel is looking in the wrong directory (root instead of `apps/web`).

## Solution: Configure Root Directory in Vercel Dashboard

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: Merchant-App (or your project name)
3. **Go to Settings** → **General**
4. **Find "Root Directory"** section
5. **Click "Edit"** and set it to: `apps/web`
6. **Click "Save"**
7. **Redeploy** your project

### Option 2: Create New Project with Correct Root

If you haven't created the project yet:

1. **Go to Vercel Dashboard** → **Add New Project**
2. **Import your repository**: `SudoDeveloper705/Merchant-App`
3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected after setting root)
   - **Root Directory**: Click "Edit" → Set to `apps/web`
   - **Build Command**: Leave as `npm run build` (default)
   - **Output Directory**: Leave as `.next` (default)
   - **Install Command**: `cd ../.. && npm install && cd apps/web && npm install`
4. **Click "Deploy"**

### Option 3: Use Vercel CLI with Root Directory

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project root
cd C:\Users\DELL\Desktop\merchantapp

# Link to your Vercel project
vercel link

# When prompted:
# - Set root directory to: apps/web
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next

# Deploy
vercel --prod
```

## Verify Configuration

After setting the root directory, verify:

1. **Vercel Dashboard** → **Settings** → **General**
   - Root Directory should show: `apps/web`
   
2. **Check Build Logs**:
   - Look for: "Installing dependencies..."
   - Should see: `next@14.0.4` being installed
   - Should see: "Building Next.js app..."

3. **Package.json Location**:
   - Vercel should read from: `apps/web/package.json`
   - Which contains: `"next": "14.0.4"`

## Current Project Structure

```
merchantapp/
├── package.json          (root - workspace config)
├── vercel.json           (root - build config)
├── apps/
│   ├── web/
│   │   ├── package.json  (contains Next.js dependency)
│   │   ├── vercel.json   (project-specific config)
│   │   └── .next/        (build output)
│   └── api/
└── packages/
    └── shared/
```

## Important Notes

- ✅ Next.js IS defined in `apps/web/package.json` as `"next": "14.0.4"`
- ✅ The build configuration is correct
- ❌ Vercel just needs to know WHERE to look (Root Directory setting)

## Quick Fix Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → General
- [ ] Set Root Directory to: `apps/web`
- [ ] Save settings
- [ ] Trigger a new deployment
- [ ] Verify build logs show Next.js installation

## After Fix

Once Root Directory is set correctly:
- Vercel will detect Next.js automatically
- Build will use `apps/web/package.json`
- Framework will be auto-detected as Next.js
- Build will execute: `npm run build` in `apps/web` directory

## Troubleshooting

If error persists after setting root directory:

1. **Clear Vercel cache**:
   - Settings → General → Clear Build Cache

2. **Check package.json exists**:
   - Verify `apps/web/package.json` exists in repository
   - Verify it contains `"next": "14.0.4"` in dependencies

3. **Check build logs**:
   - Look for the actual error message
   - Verify install command is working
   - Check if dependencies are installing correctly

4. **Manual override** (if needed):
   - Set Framework in Vercel settings to: `Next.js`
   - This forces Vercel to use Next.js even if detection fails
