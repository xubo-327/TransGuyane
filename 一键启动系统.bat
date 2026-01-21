@echo off
chcp 65001 >nul
cls
echo ================================================
echo      TransGuyane 仓库管理系统 - 一键启动
echo ================================================
echo.

:: 获取当前目录
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo [1/4] 检查后端配置...
if not exist "backend\.env" (
    echo      创建后端环境变量...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=transguyane_dev_secret_2024
    ) > "backend\.env"
    echo      [OK] 后端配置已创建
) else (
    echo      [OK] 后端配置已存在
)
echo.

echo [2/4] 检查前端配置...
if not exist "frontend\.env" (
    echo      创建前端环境变量...
    echo REACT_APP_API_URL=http://localhost:5000/api > "frontend\.env"
    echo      [OK] 前端配置已创建
) else (
    echo      [OK] 前端配置已存在
)
echo.

echo [3/4] 启动后端服务...
start "TransGuyane Backend" cmd /k "cd /d "%BASE_DIR%backend" && echo 正在启动后端... && npm start"
echo      [OK] 后端启动命令已发送
echo.

:: 等待后端启动
echo      等待后端服务启动...
timeout /t 5 /nobreak >nul

echo [4/4] 启动前端服务...
start "TransGuyane Frontend" cmd /k "cd /d "%BASE_DIR%frontend" && echo 正在启动前端... && npm start"
echo      [OK] 前端启动命令已发送
echo.

echo ================================================
echo      启动完成！
echo ================================================
echo.
echo   后端服务: http://localhost:5000/api
echo   前端界面: http://localhost:3000
echo.
echo   请等待两个新窗口中的服务启动完成后访问前端界面
echo.
echo   如果登录失败，请检查:
echo   1. MongoDB 服务是否已启动
echo   2. 后端窗口是否显示 "MongoDB连接成功"
echo.
pause
