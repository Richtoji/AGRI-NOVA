@echo off
echo =========================================
echo CLEANING UP AND STARTING SERVER
echo =========================================

echo 1. Stopping any stuck background servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo 2. Starting the database...
docker compose up -d postgres

echo 3. Waiting a moment...
timeout /t 5 /nobreak >nul

echo 4. Syncing tables and seeding users...
call npm run prisma:push
call npm run prisma:seed

echo 5. Starting your website! (LEAVE THIS WINDOW OPEN)
call npm run dev

echo.
echo IF YOU SEE THIS, THE SERVER CRASHED. PLEASE COPY THE RED ERROR TEXT ABOVE!
pause
