@echo off
chcp 65001 >nul
cls
echo ========================================
echo 彻底修复 MongoDB Atlas 连接字符串
echo ========================================
echo.
echo 使用 Node.js 脚本确保连接字符串格式正确
echo.

cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] 找不到 backend 目录
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 正在运行修复脚本...
echo.

node scripts\fixMongoURI.js

set FIX_RESULT=%errorlevel%

echo.
if %FIX_RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] 连接字符串修复成功
    echo ========================================
    echo.
    echo 下一步操作:
    echo   1. 测试连接: 检查云数据库配置.bat
    echo   2. 创建管理员: 创建管理员并测试登录.bat
    echo   3. 启动服务: 快速启动后端.bat
    echo.
) else (
    echo ========================================
    echo [ERROR] 修复过程中出现问题
    echo ========================================
    echo.
    echo 请检查错误信息并手动修复 .env 文件
    echo.
)

cd ..
pause
