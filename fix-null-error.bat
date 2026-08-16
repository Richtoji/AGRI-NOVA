@echo off
echo ===================================================
echo Windows NUL Device Fixer
echo ===================================================
echo.
echo Checking permissions (This script MUST be run as Administrator)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges confirmed. Proceeding with fix...
) else (
    echo ERROR: You must run this script as Administrator!
    echo Please right-click the script and select "Run as Administrator".
    pause
    exit /b 1
)

echo.
echo Step 1: Fixing Null service registry startup type...
reg add HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Null /v Start /t REG_DWORD /d 1 /f

echo.
echo Step 2: Configuring Null service...
sc config null start= system

echo.
echo Step 3: Starting Null service...
sc start null

echo.
echo Step 4: Restarting Windows Management Instrumentation (optional cleanup)...
net stop winmgmt /y
net start winmgmt

echo.
echo ===================================================
echo FIX APPLIED! 
echo ===================================================
echo Please restart your IDE/Editor for the changes to take effect.
pause
