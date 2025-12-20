# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your repository**: `SudoDeveloper705/Merchant-App`
4. **Configure the project**:
   - **Root Directory**: Set to `apps/web`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `cd ../.. && npm install && cd apps/web && npm install`

5. **Environment Variables** (if needed):
   - `NEXT_PUBLIC_API_BASE`: Your API URL (e.g., `https://your-api.vercel.app` or `http://localhost:4000` for development)

6. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web app
cd apps/web

# Deploy
vercel

# Follow the prompts
```

### Option 3: Connect GitHub Repository

1. Go to Vercel Dashboard
2. Click "Add New Project"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Next.js
5. Deploy!

## Important Notes

- The frontend is in `apps/web` directory
- Make sure to set the root directory to `apps/web` in Vercel settings
- The build will automatically compile the shared package first
- All pages are statically generated for optimal performance

## After Deployment

Once deployed, you'll get a Vercel URL like:
- `https://merchant-app.vercel.app`

You can then:
- View the landing page
- Test login/signup flows
- Access all dashboards (merchant owner, manager, accountant, partner owner, partner staff)

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_API_BASE`: Your backend API URL

## Troubleshooting

If build fails:
1. Check that root directory is set to `apps/web`
2. Ensure all dependencies are installed
3. Check build logs in Vercel dashboard

