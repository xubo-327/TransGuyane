@echo off
chcp 65001 >nul
cls
echo ========================================
echo 启动后端服务
echo ========================================
echo.

cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] 找不到 backend 目录或 package.json 文件
    echo 当前路径: %cd%
    pause
    exit /b 1
)

echo 当前工作目录: %cd%
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
    echo [WARNING] 未找到 .env 文件，正在创建...
    (
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=your_jwt_secret_key_change_in_production
        echo PORT=5000
    ) > .env
    echo [OK] .env 文件已创建
)

echo 正在启动后端服务...
echo.
call npm run dev
