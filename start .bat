@echo off
title Maid Rei - quick start

echo ============================================
echo   Maid Rei start script
echo   It will check dependencies and start dev server
echo ============================================
echo.

REM Check if node_modules exists
if exist "node_modules" (
  echo [OK] node_modules found, skip npm install.
) else (
  echo [INFO] node_modules not found, running npm install...
  echo.
  npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. Please check your Node.js / npm installation.
    echo Press any key to exit...
    pause >nul
    exit /b 1
  )
  echo.
  echo [OK] Dependencies installed.
)

echo.
echo Starting dev server: npm run dev ...
echo.
npm run dev
