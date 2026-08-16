@echo off
cd /d "%~dp0"

echo =========================================
echo  AGRI-NOVA First-Time Push Fixer
echo =========================================
echo.
echo This will safely overwrite any default files (like a README) 
echo that GitHub created when you made the repository, and replace 
echo them with your actual project code.

echo.
echo 1. Staging files...
git add .

echo.
echo 2. Committing files...
git commit -m "Auto-save"

echo.
echo 3. Force pushing to GitHub...
git push -u origin main -f

echo.
echo =========================================
echo  DONE! 
echo =========================================
pause
