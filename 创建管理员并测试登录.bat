@echo off
chcp 65001 >nul
cls
echo ========================================
echo 创建管理员账号并测试登录
echo ========================================
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
echo 创建/更新管理员账号
echo ========================================
echo.
echo 管理员账号信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo   角色: admin
echo.

node scripts\createAdmin.js
set ADMIN_RESULT=%errorlevel%

echo.
if %ADMIN_RESULT% equ 0 (
    echo ========================================
    echo 管理员账号创建/更新成功
    echo ========================================
    echo.
    echo 现在可以尝试登录:
    echo   用户名: xubo327
    echo   密码: 3273279x
    echo.
    echo 如果仍然无法登录，请检查:
    echo   1. 后端服务是否正在运行 (端口 5000)
    echo   2. 浏览器控制台是否有错误信息 (按 F12)
    echo   3. 网络连接是否正常
    echo.
) else (
    echo ========================================
    echo 管理员账号创建失败
    echo ========================================
    echo.
    echo 可能的原因:
    echo   1. MongoDB 连接失败
    echo   2. 数据库配置错误
    echo   3. 脚本执行出错
    echo.
    echo 请检查后端服务是否正常运行
    echo.
)

cd ..
pause
