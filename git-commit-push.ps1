# Git Commit and Push Script for Merchant App
# Run this script after installing Git

Write-Host "Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/SudoDeveloper705/Merchant-App.git

Write-Host "Adding all files..." -ForegroundColor Green
git add .

Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Initial commit: Merchant App with Partner Dashboard features

- Implemented Partner Owner and Partner Staff dashboards
- Added merchant switcher with mock data fallbacks
- Implemented partner user invitation system
- Added role-based access control for partner users
- Created invoices, payouts, and reports pages
- Added mock data support for testing without backend
- Fixed network error handling across all partner pages"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "Done! Your code has been pushed to GitHub." -ForegroundColor Green

