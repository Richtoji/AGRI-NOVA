@echo off
echo Starting AGRI-NOVA Local Environment...
echo ----------------------------------------
start cmd.exe /k "npm run dev"
start cmd.exe /k "cd ai_server && uvicorn main:app --host 0.0.0.0 --port 8000"
echo Done! You can view the website at http://localhost:3000
