@echo off
chcp 65001 >nul
cls
echo ========================================
echo 完整启动服务（后端 + 前端）
echo ========================================
echo.

echo [提示] 此脚本会启动后端和前端服务
echo 请确保:
echo   1. MongoDB Atlas 已配置（如使用云数据库）
echo   2. 管理员账号已创建
echo.
pause

echo.
echo [步骤 1/3] 检查后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 后端服务已在运行（端口 5000）
    echo.
) else (
    echo [INFO] 后端服务未运行
    echo 正在启动后端服务...
    echo.
    echo 请在新的命令窗口启动后端:
    echo   双击运行: 解决端口冲突并重启后端.bat
    echo   或运行: 快速启动后端.bat
    echo.
    echo 等待后端启动成功后再继续...
    pause
)

echo [步骤 2/3] 检查前端服务状态...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 前端服务已在运行（端口 3000）
    echo.
    echo 前端地址: http://localhost:3000
    echo.
) else (
    echo [INFO] 前端服务未运行
    echo.
)

echo [步骤 3/3] 启动前端服务...
echo.

cd /d "%~dp0frontend"
if not exist "package.json" (
    echo [ERROR] 找不到 frontend 目录
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] 前端依赖未安装，正在安装...
    echo 这可能需要几分钟时间，请稍候...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo 正在启动前端服务...
echo ========================================
echo.
echo 前端服务启动后会自动打开浏览器
echo 如果没有自动打开，请手动访问: http://localhost:3000
echo.
echo 按 Ctrl+C 可以停止前端服务
echo.

call npm start
