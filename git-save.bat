@echo off
cd /d "%~dp0"

echo =========================================
echo  AGRI-NOVA Auto-Save ^& Push
echo =========================================
echo.

:: Clear any stuck processes just in case
git rebase --abort 2>nul
rmdir /s /q ".git\rebase-merge" 2>nul

set /p msg="Enter a commit message (or just press Enter to use 'Auto-save'): "
if "%msg%"=="" set msg=Auto-save

echo.
echo 1. Staging files...
git add .

echo.
echo 2. Committing files...
git commit -m "%msg%"

echo.
echo 3. Downloading any missing GitHub changes...
git pull origin main --no-rebase --allow-unrelated-histories -m "Merge remote changes"

echo.
echo 4. Pushing to GitHub...
git push -u origin main

echo.
echo =========================================
echo  DONE! All code is saved to GitHub.
echo =========================================
pause
