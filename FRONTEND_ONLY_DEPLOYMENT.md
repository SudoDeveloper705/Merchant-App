# Deploy Frontend Only - Quick Guide

This guide will help you deploy **just the frontend** to view all pages, dashboards, and forms. The app has built-in mock data, so it works without the API!

## Step-by-Step Deployment

### 1. Go to Vercel Dashboard

Visit: https://vercel.com/dashboard

### 2. Create New Project

1. Click **"Add New Project"** button
2. Select your GitHub repository: `SudoDeveloper705/Merchant-App`
3. Click **"Import"**

### 3. Configure Project

**Project Name**: `merchant-app` (or any name you like)

**Framework Preset**: 
- Should auto-detect as **Next.js** ✅
- If not, select **Next.js** manually

**Root Directory** (IMPORTANT):
- In the Vercel import screen, look for **"Root Directory"** field
- Click **"Edit"** or the pencil icon next to it
- Change from `.` (root) to: `apps/web`
- Click **"Continue"** or **"Deploy"**

**Note**: This setting is in the Vercel UI, NOT in the vercel.json file!

**Build Settings** (Vercel should auto-detect, but verify):
- **Build Command**: `cd ../.. && npm run build:shared && cd apps/web && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `cd ../.. && npm install`

**Note**: The build command builds the shared package first (required dependency), then builds the web app.

### 4. Environment Variables (Optional)

You can skip this for now since the app works with mock data!

If you want to connect to your API later, add:
- **Name**: `NEXT_PUBLIC_API_BASE`
- **Value**: `https://merchant-app-api-2tvr.vercel.app`

But for now, **just click "Deploy"** without adding any environment variables.

### 5. Deploy!

Click the **"Deploy"** button and wait 2-3 minutes.

### 6. Access Your Site

After deployment, you'll get a URL like:
- `https://merchant-app.vercel.app` or
- `https://merchant-app-[your-name].vercel.app`

## What You Can View

Once deployed, you can access:

✅ **Landing Page**: `/` (homepage)
✅ **Login Page**: `/login`
✅ **Signup Pages**: `/signup` (merchant) and `/partner/signup` (partner)
✅ **Merchant Dashboard**: `/merchant/dashboard` (with mock data)
✅ **Partner Dashboard**: `/partner/dashboard` (with mock data)
✅ **All Forms and Pages**: All dashboards, invoices, payouts, reports, etc.

## Using Mock Data

The app automatically uses mock data when the API is not available, so:
- ✅ All pages will load
- ✅ Dashboards will show sample data
- ✅ Forms will be visible
- ✅ Navigation will work
- ⚠️ Login/Signup won't actually authenticate (but forms are visible)

## Troubleshooting

### Build Fails?

1. **Check Root Directory**: Must be `apps/web`
2. **Check Install Command**: Should be `cd ../.. && npm install && cd apps/web && npm install`
3. **Check Build Logs**: Click on the failed deployment to see errors

### Pages Show Errors?

- The app uses mock data, so most pages should work
- If you see network errors, that's normal - the app will use mock data instead

### Want to Connect to API Later?

1. Go to **Project Settings** → **Environment Variables**
2. Add: `NEXT_PUBLIC_API_BASE` = `https://merchant-app-api-2tvr.vercel.app`
3. **Redeploy** the project

## Quick Checklist

- [ ] Created new Vercel project
- [ ] Set Root Directory to `apps/web`
- [ ] Clicked "Deploy"
- [ ] Got deployment URL
- [ ] Can access landing page
- [ ] Can view dashboards (with mock data)

## That's It! 🎉

Your frontend is now live and you can view all pages, dashboards, and forms!

