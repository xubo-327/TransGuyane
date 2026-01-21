@echo off
chcp 65001 >nul
echo ========================================
echo 安装前端依赖
echo ========================================
echo.

echo 正在安装前端依赖，这可能需要几分钟...
echo.

cd frontend

if exist "node_modules" (
    echo 检测到 node_modules 目录，但可能依赖不完整
    echo 正在重新安装...
    echo.
    call npm install
) else (
    echo 首次安装依赖...
    echo.
    call npm install
)

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [OK] 依赖安装成功！
    echo ========================================
    echo.
    echo 现在可以运行: npm start
    echo.
) else (
    echo.
    echo ========================================
    echo [ERROR] 依赖安装失败
    echo ========================================
    echo.
    echo 请检查：
    echo 1. Node.js 是否已正确安装
    echo 2. 网络连接是否正常
    echo 3. 尝试清除缓存: npm cache clean --force
    echo.
)

cd ..
pause
