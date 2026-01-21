@echo off
chcp 65001 >nul
cls
echo ========================================
echo TransGuyane 一键停止服务
echo ========================================
echo.

echo 正在停止后端服务（端口 5000）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] 后端服务已停止

echo 正在停止前端服务（端口 3000）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] 前端服务已停止

echo.
echo ========================================
echo 所有服务已停止
echo ========================================
echo.
pause
