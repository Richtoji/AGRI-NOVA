@echo off
echo =========================================
echo FORCE RESTARTING AND REBUILDING EVERYTHING
echo =========================================

echo 1. Stopping any old Docker containers...
docker compose down

echo 2. Killing any background processes on port 3000...
npx kill-port 3000

echo 3. Deleting old Next.js build cache...
rmdir /s /q .next

echo 4. Rebuilding Docker image from scratch (this takes a minute)...
docker compose build --no-cache frontend

echo 5. Starting the website in Docker...
docker compose up -d frontend

echo =========================================
echo DONE! Please refresh http://localhost:3000/
echo =========================================
pause
