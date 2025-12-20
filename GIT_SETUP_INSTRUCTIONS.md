# Git Setup and Push Instructions

## Step 1: Install Git

If Git is not installed, download it from: https://git-scm.com/download/win

After installation, restart your terminal/PowerShell.

## Step 2: Configure Git (if not already done)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Run the Setup Script

I've created a PowerShell script `git-commit-push.ps1` that will:
1. Initialize the git repository
2. Add the remote repository
3. Add all files
4. Commit with a descriptive message
5. Push to GitHub

Run it with:
```powershell
.\git-commit-push.ps1
```

## Alternative: Manual Commands

If you prefer to run commands manually:

```powershell
# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/SudoDeveloper705/Merchant-App.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Merchant App with Partner Dashboard features"

# Set main branch and push
git branch -M main
git push -u origin main
```

## Note

If you get authentication errors when pushing, you may need to:
1. Use a Personal Access Token instead of password
2. Or use SSH authentication

For GitHub Personal Access Token:
- Go to: https://github.com/settings/tokens
- Generate a new token with `repo` permissions
- Use the token as your password when prompted

