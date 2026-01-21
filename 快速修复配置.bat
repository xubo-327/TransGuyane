@echo off
chcp 65001 >nul
cls
echo ========================================
echo 快速修复配置
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/2] 创建后端 .env 文件...
if not exist "backend\.env" (
    echo 正在创建...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024
        echo WECHAT_APPID=your_appid
        echo WECHAT_SECRET=your_secret
    ) > backend\.env
    echo [OK] 已创建 backend\.env
) else (
    echo [OK] backend\.env 已存在
)
echo.

echo [步骤 2/2] 创建前端 .env 文件...
if not exist "frontend\.env" (
    echo 正在创建...
    echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
    echo [OK] 已创建 frontend\.env
) else (
    echo [OK] frontend\.env 已存在
    findstr /C:"REACT_APP_API_URL" frontend\.env >nul 2>&1
    if errorlevel 1 (
        echo REACT_APP_API_URL=http://localhost:5000/api >> frontend\.env
        echo [OK] 已添加 API URL 配置
    )
)
echo.

echo ========================================
echo 配置完成
echo ========================================
echo.
echo 下一步:
echo   1. 如果使用 MongoDB Atlas，运行: 配置MongoDB Atlas.bat
echo   2. 启动后端服务: 快速启动后端.bat
echo   3. 启动前端服务: 启动前端.bat
echo.
pause
