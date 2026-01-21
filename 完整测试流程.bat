@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 完整测试流程
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/4] 修复连接字符串...
cd backend
if not exist "node_modules" (
    call npm install >nul 2>&1
)
node scripts\fixMongoURI.js
set FIX_RESULT=!errorlevel!
cd ..
if !FIX_RESULT! neq 0 (
    echo [WARNING] 连接字符串修复可能有问题
)
echo.

echo [步骤 2/4] 测试数据库连接...
cd backend
node scripts\testConnection.js
set TEST_RESULT=!errorlevel!
cd ..
if !TEST_RESULT! neq 0 (
    echo [ERROR] 数据库连接失败
    echo 请检查 MongoDB Atlas 网络访问设置
    pause
    exit /b 1
)
echo.

echo [步骤 3/4] 创建管理员账号...
cd backend
node scripts\createAdmin.js
set ADMIN_RESULT=!errorlevel!
cd ..
if !ADMIN_RESULT! equ 0 (
    echo [OK] 管理员账号已创建
    echo 用户名: xubo327
    echo 密码: 3273279x
)
echo.

echo [步骤 4/4] 检查服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] 后端服务已在运行
) else (
    echo [INFO] 后端服务未运行，请运行: 快速启动后端.bat
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] 前端服务已在运行
) else (
    echo [INFO] 前端服务未运行，请运行: 启动前端.bat
)
echo.

echo ========================================
echo [SUCCESS] 测试完成
echo ========================================
echo.
echo 下一步:
echo 1. 启动后端: 快速启动后端.bat
echo 2. 启动前端: 启动前端.bat
echo 3. 登录: http://localhost:3000
echo    用户名: xubo327
echo    密码: 3273279x
echo.
pause
