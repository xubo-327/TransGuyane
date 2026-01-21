@echo off
chcp 65001 >nul
cls
echo ========================================
echo 解决端口冲突并重启后端服务
echo ========================================
echo.

echo [步骤 1/4] 查找占用端口 5000 的所有进程...
echo.

REM 获取所有占用端口 5000 的 PID
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    set "PID=%%a"
    if not "!PID!"=="" if not "!PID!"=="0" (
        echo 找到进程 ID: !PID!
        tasklist /FI "PID eq !PID!" 2>nul | findstr /V "INFO:" | findstr /V "="
        echo.
    )
)

echo [步骤 2/4] 结束占用端口的进程...
echo.

setlocal enabledelayedexpansion
set "found=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="" if not "!PID!"=="0" (
        set "found=1"
        echo 正在结束进程 !PID!...
        taskkill /PID !PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] 进程 !PID! 已结束
        ) else (
            echo [WARNING] 无法结束进程 !PID!，可能需要管理员权限
        )
    )
)

if "!found!"=="0" (
    echo [INFO] 未找到正在监听端口 5000 的进程
    echo 端口可能处于 TIME_WAIT 状态，等待几秒钟...
)

echo.
echo [步骤 3/4] 等待端口完全释放...
timeout /t 5 /nobreak >nul

REM 再次检查
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] 端口 5000 仍被占用
    echo 请手动检查并结束占用端口的进程
    pause
    exit /b 1
) else (
    echo [OK] 端口 5000 已释放
)

echo.
echo [步骤 4/4] 启动后端服务...
echo.

cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] 找不到 backend 目录
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo 正在启动后端服务...
echo ========================================
echo.
echo 请等待服务启动，看到以下信息表示启动成功:
echo   - "MongoDB连接成功" 或 "MongoDB Atlas (云数据库) 连接成功"
echo   - "服务器运行在端口 5000"
echo.
echo 如果出现错误，请查看错误信息
echo.

call npm run dev
