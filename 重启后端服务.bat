@echo off
chcp 65001 >nul
cls
echo ========================================
echo 重启后端服务
echo ========================================
echo.

echo [步骤 1/3] 查找并结束占用端口 5000 的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    set "PID=%%a"
    goto :found_pid
)

:found_pid
if defined PID (
    echo 找到进程 ID: %PID%
    echo 正在结束进程...
    taskkill /PID %PID% /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] 进程已结束
    ) else (
        echo [WARNING] 无法结束进程，可能需要手动结束
    )
    timeout /t 2 >nul
) else (
    echo [INFO] 未找到占用端口 5000 的进程
)

echo.
echo [步骤 2/3] 验证端口已释放...
timeout /t 2 >nul
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] 端口 5000 仍然被占用
    echo 请手动结束占用端口的进程
    pause
    exit /b 1
) else (
    echo [OK] 端口 5000 已释放
)

echo.
echo [步骤 3/3] 启动后端服务...
cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] 找不到 backend 目录
    pause
    exit /b 1
)

echo 当前目录: %cd%
echo.

if not exist "node_modules" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo [WARNING] 未找到 .env 文件，正在创建默认配置...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > .env
    echo [OK] .env 文件已创建
    echo [注意] 如果使用云数据库，请运行: 一键配置Atlas连接.bat
)

echo.
echo ========================================
echo 正在启动后端服务...
echo ========================================
echo.
echo 请等待后端服务启动完成（通常需要几秒钟）
echo 看到 "MongoDB连接成功" 和 "服务器运行在端口 5000" 表示启动成功
echo.
echo 如果出现错误，请查看错误信息并按提示解决
echo.

call npm run dev
