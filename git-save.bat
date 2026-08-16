@echo off
cd /d "%~dp0"

echo =========================================
echo  AGRI-NOVA Auto-Save ^& Push
echo =========================================
echo.

:: Ask the user for a custom commit message
set /p msg="Enter a commit message (or just press Enter to use 'Auto-save'): "

:: If the user just pressed enter, use a default message
if "%msg%"=="" set msg=Auto-save

echo.
echo 1. Staging files...
git add .

echo.
echo 2. Committing files with message: "%msg%"
git commit -m "%msg%"

echo.
echo 3. Pushing to GitHub...
git push -u origin main

echo.
echo =========================================
echo  DONE! All code is saved to GitHub.
echo =========================================
pause
