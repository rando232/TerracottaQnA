@echo off
echo ============================================
echo Starting Terracotta Q&A Platform
echo ============================================
echo.

REM Start Backend
echo [1/2] Starting Backend Server...
start "Terracotta Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend Server...
start "Terracotta Frontend" cmd /k "cd /d %~dp0frontend-react && npm start"

echo.
echo ============================================
echo Servers Starting...
echo ============================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo ============================================
echo.
echo Press any key to close this window...
pause >nul
