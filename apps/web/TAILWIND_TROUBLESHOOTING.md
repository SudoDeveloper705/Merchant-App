# Tailwind CSS Troubleshooting

## ✅ Configuration Complete

All files are properly configured:
- ✅ `tailwind.config.js` - Content paths configured
- ✅ `postcss.config.js` - PostCSS plugins set
- ✅ `globals.css` - Tailwind directives added
- ✅ Packages installed (tailwindcss, postcss, autoprefixer)

## 🔧 If CSS Still Not Loading

### 1. Clear Next.js Cache
```powershell
cd apps/web
Remove-Item -Recurse -Force .next
npm run dev
```

### 2. Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 3. Check Browser Console
Open DevTools (F12) and check for:
- CSS file loading errors
- 404 errors for CSS files
- Any Tailwind-related errors

### 4. Verify CSS File is Loading
In browser DevTools → Network tab:
- Look for `globals.css` or similar CSS file
- Check if it's loading (status 200)
- Check if it contains Tailwind classes

### 5. Verify Tailwind is Processing
The compiled CSS should include Tailwind utility classes. Check the loaded CSS file - it should be large (several KB) with many utility classes.

### 6. Check Content Paths
Ensure your component files match the paths in `tailwind.config.js`:
- `./src/app/**/*.{js,ts,jsx,tsx,mdx}`
- `./src/components/**/*.{js,ts,jsx,tsx,mdx}`

### 7. Restart Dev Server
Sometimes Next.js needs a full restart:
```powershell
# Stop server (Ctrl+C)
# Then restart:
cd apps/web
npm run dev
```

## 🧪 Test Tailwind

Add this to any page to test:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Tailwind Test
</div>
```

If this shows with blue background and white text, Tailwind is working!

## 📝 Common Issues

**Issue: CSS loads but Tailwind classes don't work**
- Check content paths in `tailwind.config.js`
- Ensure files are in the correct directories
- Restart dev server

**Issue: CSS file not loading at all**
- Check `layout.tsx` imports `globals.css`
- Verify file path is correct
- Check browser console for 404 errors

**Issue: Styles partially working**
- Clear `.next` cache
- Hard refresh browser
- Check for conflicting CSS

## ✅ Verification Checklist

- [ ] `tailwind.config.js` exists and has correct content paths
- [ ] `postcss.config.js` exists with tailwindcss and autoprefixer
- [ ] `globals.css` has `@tailwind` directives at the top
- [ ] `layout.tsx` imports `./globals.css`
- [ ] Packages installed: `tailwindcss`, `postcss`, `autoprefixer`
- [ ] `.next` cache cleared
- [ ] Dev server restarted
- [ ] Browser cache cleared / hard refresh

