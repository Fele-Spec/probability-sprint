@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8765

rem Open the browser directly if the server is already up.
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:%PORT%/' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
  echo ProbSprint is already running: http://127.0.0.1:%PORT%/
  start "" "http://127.0.0.1:%PORT%/"
  exit /b 0
)

echo.
echo   ProbSprint / Probability Sprint
echo   http://127.0.0.1:%PORT%/
echo.
echo   Close this window to stop the local server.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:%PORT%/'"

python -m http.server %PORT% --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo Python not found. Trying the py launcher...
  py -m http.server %PORT% --bind 127.0.0.1
)

pause
