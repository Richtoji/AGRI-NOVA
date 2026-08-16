@echo off
echo Initializing Git repository...
git init

echo.
echo Adding remote origin (https://github.com/Richtoji/AGRI-NOVA.git)...
git remote add origin https://github.com/Richtoji/AGRI-NOVA.git 2>nul
if %errorlevel% neq 0 (
    echo Remote 'origin' already exists. Updating URL...
    git remote set-url origin https://github.com/Richtoji/AGRI-NOVA.git
)

echo.
echo Staging files...
git add .

echo.
echo Committing changes...
git commit -m "Fix: QA Audit fixes for RBAC middleware, log paths, and login UI"

echo.
echo Renaming branch to main...
git branch -M main

echo.
echo Pushing to GitHub (you may be prompted to log in)...
git push -u origin main

echo.
echo Done!
pause
