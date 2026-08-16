@echo off
echo =========================================
echo REBUILDING DOCKER (WITH ERROR LOGGING)
echo =========================================

echo 1. Stopping frontend container...
docker compose stop frontend

echo 2. Rebuilding frontend image from scratch...
docker compose build --no-cache frontend > docker-build.log 2>&1

echo 3. Starting frontend container...
docker compose up -d --no-deps frontend >> docker-build.log 2>&1

echo =========================================
echo DONE! Check docker-build.log for results.
echo =========================================
pause
