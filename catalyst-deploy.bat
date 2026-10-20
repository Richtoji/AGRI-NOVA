@echo off
echo ===================================================
echo     Deploying AGRI-NOVA to Zoho Catalyst AppSail
echo ===================================================
echo.
catalyst deploy appsail --name agri-nova --build-path "%~dp0." --stack node20 --command "npm run start:catalyst"
echo.
pause
