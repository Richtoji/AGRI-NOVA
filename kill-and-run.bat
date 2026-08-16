@echo off
echo =========================================
echo KILLING ROGUE SERVERS AND STARTING FRESH
echo =========================================

echo 1. Stopping Docker containers (just in case)...
docker compose down

echo 2. Finding and destroying ANY process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Killing process ID %%a...
        taskkill /F /PID %%a
    )
)

echo 3. Waiting a second to ensure port is freed...
timeout /t 2 /nobreak >nul

echo 4. Starting the server from THIS exact folder...
call npm run dev

pause
