@echo off
chcp 65001 >nul
cls
echo ========================================
echo 创建管理员账号
echo ========================================
echo.

echo [检查] Node.js 环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装或未添加到 PATH
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    echo 安装后重启此脚本
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js 环境正常
echo.

echo 账号信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.
echo 正在创建管理员账号...
echo.

cd backend
if not exist "scripts\createAdmin.js" (
    echo [ERROR] 脚本文件不存在: scripts\createAdmin.js
    cd ..
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [WARNING] 后端依赖未安装，正在安装...
    call npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        echo 请手动运行: npm install
        cd ..
        pause
        exit /b 1
    )
    echo [OK] 依赖安装完成
    echo.
)

node scripts/createAdmin.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] 管理员账号创建/更新成功！
    echo ========================================
    echo.
    echo 您可以使用以下账号登录：
    echo 用户名: xubo327
    echo 密码: 3273279x
    echo.
    echo 登录后将自动进入管理后台
    echo.
) else (
    echo.
    echo [ERROR] 创建管理员账号失败
    echo.
    echo 请检查：
    echo 1. MongoDB 服务是否已启动
    echo 2. backend/.env 文件中的数据库连接配置是否正确
    echo 3. Node.js 是否已正确安装
    echo.
)

cd ..
pause
