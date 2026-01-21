@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 检查并启动所有服务
echo ========================================
echo.

cd /d "%~dp0"

echo [检查 1/3] 后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 后端服务正在运行（端口 5000）
    set BACKEND_RUNNING=1
) else (
    echo [ERROR] 后端服务未运行
    echo.
    echo 正在测试后端 API...
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '[OK] 后端 API 可访问' } catch { Write-Host '[ERROR] 后端 API 无响应' }" 2>nul
    echo.
    echo 请启动后端服务: 快速启动后端.bat
    set BACKEND_RUNNING=0
)
echo.

echo [检查 2/3] 前端服务状态...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 前端服务正在运行（端口 3000）
    set FRONTEND_RUNNING=1
) else (
    echo [INFO] 前端服务未运行
    echo 可以启动前端服务: 启动前端.bat
    set FRONTEND_RUNNING=0
)
echo.

echo [检查 3/3] 前端 API 配置...
if exist "frontend\.env" (
    echo [OK] frontend\.env 文件存在
    findstr /C:"REACT_APP_API_URL" frontend\.env | findstr "http://localhost:5000/api" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] API URL 配置正确
    ) else (
        echo [WARNING] API URL 配置可能不正确
        echo 当前配置:
        findstr /C:"REACT_APP_API_URL" frontend\.env
    )
) else (
    echo [WARNING] frontend\.env 文件不存在
    echo 正在创建...
    echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
    echo [OK] 已创建
)
echo.

echo ========================================
echo 诊断结果
echo ========================================
echo.
if !BACKEND_RUNNING! equ 0 (
    echo [重要] 后端服务未运行！
    echo.
    echo 解决方案:
    echo   1. 打开新窗口
    echo   2. 运行: 快速启动后端.bat
    echo   3. 等待看到 "服务器运行在端口 5000"
    echo   4. 然后刷新浏览器页面重试登录
    echo.
)

if !FRONTEND_RUNNING! equ 0 (
    echo [提示] 前端服务未运行
    echo 如需启动: 运行 启动前端.bat
    echo.
)

if !BACKEND_RUNNING! equ 1 (
    echo [SUCCESS] 所有服务检查通过
    echo.
    echo 如果仍然无法登录，请检查:
    echo   1. 浏览器控制台（F12）的具体错误信息
    echo   2. 后端服务窗口是否有错误信息
    echo   3. 尝试清除浏览器缓存并刷新页面
    echo.
)

echo 管理员登录信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.

pause
