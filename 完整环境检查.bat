@echo off
chcp 65001 >nul
cls
echo ========================================
echo 完整环境检查工具
echo ========================================
echo.

set ALL_OK=1

echo [1/4] 检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装
    echo   请访问: https://nodejs.org/ 下载安装
    set ALL_OK=0
) else (
    echo [OK] Node.js 已安装
    echo    版本信息:
    node --version 2>nul
    npm --version 2>nul
)
echo.

echo [2/4] 检查 MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB 服务已安装
    sc query MongoDB | findstr /C:"RUNNING" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   状态: 正在运行
    ) else (
        echo   [WARNING] MongoDB 服务未运行
        echo   请启动 MongoDB 服务
        set ALL_OK=0
    )
) else (
    echo [WARNING] 未检测到 MongoDB 服务
    echo   请确保 MongoDB 已安装并运行
    echo   或使用 MongoDB Atlas (云数据库)
    set ALL_OK=0
)
echo.

echo [3/4] 检查项目文件...
if exist "backend\package.json" (
    echo [OK] 后端项目文件存在
) else (
    echo [ERROR] 后端项目文件不存在
    set ALL_OK=0
)

if exist "frontend\package.json" (
    echo [OK] 前端项目文件存在
) else (
    echo [ERROR] 前端项目文件不存在
    set ALL_OK=0
)
echo.

echo [4/4] 检查依赖安装...
if exist "backend\node_modules" (
    echo [OK] 后端依赖已安装
) else (
    echo [WARNING] 后端依赖未安装
    echo   运行: cd backend ^&^& npm install
    set ALL_OK=0
)

if exist "frontend\node_modules" (
    echo [OK] 前端依赖已安装
) else (
    echo [WARNING] 前端依赖未安装
    echo   运行: cd frontend ^&^& npm install
    set ALL_OK=0
)
echo.

echo ========================================
if %ALL_OK% equ 1 (
    echo [SUCCESS] 所有检查通过，环境就绪！
    echo ========================================
    echo.
    echo 下一步操作:
    echo 1. 启动后端: cd backend ^&^& npm run dev
    echo 2. 启动前端: cd frontend ^&^& npm start
    echo 3. 创建管理员: 快速创建管理员.bat
    echo.
) else (
    echo [WARNING] 发现问题，请先解决上述问题
    echo ========================================
    echo.
)
pause
