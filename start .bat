@echo off
title Maid Rei - 一键启动

echo ============================================
echo   Maid Rei 启动脚本
echo   将自动检查依赖并启动开发服务器
echo ============================================
echo.

REM 检查 node_modules 是否存在
if exist "node_modules" (
  echo [OK] 已检测到 node_modules，跳过依赖安装。
) else (
  echo [INFO] 未检测到 node_modules，正在为你安装依赖...
  echo.
  npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install 失败，请检查 Node.js/npm 是否安装正常。
    echo 按任意键退出...
    pause >nul
    exit /b 1
  )
  echo.
  echo [OK] 依赖安装完成。
)

echo.
echo 正在启动开发服务器 (npm run dev) ...
echo.
npm run dev
