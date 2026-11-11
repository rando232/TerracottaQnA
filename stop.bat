@echo off
echo ============================================
echo Stopping Terracotta Q&A Platform
echo ============================================
echo.

echo Stopping Python/Uvicorn processes...
powershell -Command "Get-Process python -ErrorAction SilentlyContinue | ForEach-Object { $cmdLine = (Get-CimInstance Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine; if ($cmdLine -like '*uvicorn*') { Stop-Process -Id $_.Id -Force } }"

echo Stopping Node/React processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | ForEach-Object { $cmdLine = (Get-CimInstance Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine; if ($cmdLine -like '*react-scripts*') { Stop-Process -Id $_.Id -Force } }"

echo.
echo ============================================
echo All servers stopped!
echo ============================================
echo.
pause
