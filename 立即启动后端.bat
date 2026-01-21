@echo off
chcp 65001 >nul
cls
echo ========================================
echo   启动后端服务
echo ========================================
echo.

cd /d "%~dp0backend"

echo 当前目录: %cd%
echo.

:: 检查 .env 文件
if not exist ".env" (
    echo [创建] 配置文件...
    echo PORT=5000> .env
    echo MONGODB_URI=mongodb://localhost:27017/warehouse_management>> .env
    echo JWT_SECRET=transguyane_dev_secret_2024>> .env
    echo [OK] 配置文件已创建
    echo.
    echo [警告] 使用本地 MongoDB，请确保 MongoDB 服务已启动
    echo        或运行 "快速配置数据库.bat" 配置云数据库
    echo.
)

:: 检查依赖
if not exist "node_modules" (
    echo [安装] 后端依赖...
    call npm install --registry=https://registry.npmmirror.com
    echo.
)

echo ========================================
echo   正在启动后端服务...
echo ========================================
echo.
echo 请观察下面的输出：
echo - 如果显示 "MongoDB连接成功" 和 "服务器运行在端口 5000" 表示成功
echo - 如果显示 "MongoDB连接失败" 需要配置数据库
echo.
echo ----------------------------------------

npm start
