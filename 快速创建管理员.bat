@echo off
chcp 65001 >nul
cls
echo ========================================
echo 快速创建管理员账号
echo ========================================
echo.
echo 账号信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.
echo ========================================
echo.

cd backend

if not exist "scripts\createAdmin.js" (
    echo [ERROR] 脚本文件不存在: scripts\createAdmin.js
    cd ..
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [WARNING] 后端依赖未安装
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        cd ..
        pause
        exit /b 1
    )
)

echo 正在创建管理员账号...
echo.

node scripts/createAdmin.js

set RESULT=%errorlevel%
cd ..

echo.
if %RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] 管理员账号创建成功！
    echo ========================================
    echo.
    echo 现在可以使用以下账号登录管理后台:
    echo   用户名: xubo327
    echo   密码: 3273279x
    echo.
) else (
    echo ========================================
    echo [ERROR] 创建失败
    echo ========================================
    echo.
    echo 请检查:
    echo   1. MongoDB 服务是否已启动
    echo   2. backend\.env 文件是否存在且配置正确
    echo   3. 查看上方的详细错误信息
    echo.
)

pause
