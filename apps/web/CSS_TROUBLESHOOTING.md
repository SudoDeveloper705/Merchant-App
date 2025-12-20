# CSS Troubleshooting Guide

If CSS is not loading, follow these steps:

## 1. Clear All Caches

```powershell
# Stop the dev server (Ctrl+C)
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## 2. Verify CSS File Exists

The CSS file should be at: `apps/web/src/app/globals.css`

It should contain:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 3. Check Browser Console

Open DevTools (F12) and check:
- **Console tab**: Look for CSS-related errors
- **Network tab**: 
  - Filter by "CSS"
  - Look for `globals.css` or `_app.css`
  - Check if it returns 200 status
  - Check if the file size is > 0

## 4. Verify Tailwind Config

File: `apps/web/tailwind.config.js`

Should include:
```js
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

## 5. Hard Refresh Browser

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or clear browser cache completely.

## 6. Check Dev Server Output

Look for errors in the terminal where `npm run dev` is running.

Common errors:
- "PostCSS plugin error"
- "Tailwind CSS not found"
- Build errors

## 7. Verify Dependencies

```bash
cd apps/web
npm list tailwindcss postcss autoprefixer
```

All should be installed.

## 8. Test with Inline Styles

Temporarily add inline styles to verify React is working:

```tsx
<div style={{ color: 'red', padding: '20px' }}>
  Test content
</div>
```

If inline styles work but Tailwind doesn't, it's a Tailwind/PostCSS issue.

## 9. Reinstall Dependencies

```bash
cd apps/web
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

## 10. Check Next.js Version

Next.js 14 should work with Tailwind. Verify:
```bash
cd apps/web
npm list next
```

Should be version 14.x.x

