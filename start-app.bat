@echo off
echo =========================================
echo STARTING DATABASE AND WEBSITE
echo =========================================

echo 1. Starting the Database...
docker compose up -d postgres

echo 2. Waiting for Database to boot...
timeout /t 5 /nobreak >nul

echo 3. Syncing Database Tables...
call npm run prisma:push

echo 4. Seeding Demo Users (like farmer@agri-nova.com)...
call npm run prisma:seed

echo 5. Starting the Website...
call npm run dev

pause
