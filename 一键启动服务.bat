@echo off
chcp 65001 >nul
cls
echo ========================================
echo 一键启动服务
echo ========================================
echo.

cd /d "%~dp0"

echo [检查] 后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 后端服务已在运行
    goto :check_frontend
) else (
    echo [INFO] 后端服务未运行
    echo.
    echo 正在启动后端服务...
    echo.
)

:check_frontend
echo [检查] 前端服务状态...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 前端服务已在运行
    goto :summary
) else (
    echo [INFO] 前端服务未运行
)

:summary
echo.
echo ========================================
echo 服务状态
echo ========================================
echo.
echo 后端服务 (端口 5000):
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [运行中]
) else (
    echo   [未运行] - 需要启动
)
echo.
echo 前端服务 (端口 3000):
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [运行中]
) else (
    echo   [未运行] - 需要启动
)
echo.

echo ========================================
echo 启动指南
echo ========================================
echo.
echo 1. 启动后端服务（新窗口）:
echo    双击运行: 快速启动后端.bat
echo    等待看到 "服务器运行在端口 5000"
echo.
echo 2. 启动前端服务（另一个新窗口）:
echo    双击运行: 启动前端.bat
echo    等待看到 "Compiled successfully!"
echo.
echo 3. 在浏览器中访问:
echo    http://localhost:3000
echo.
echo 4. 登录信息:
echo    用户名: xubo327
echo    密码: 3273279x
echo.
echo ========================================
echo.
echo 提示: 两个服务需要在不同的窗口运行
echo       不要关闭服务窗口，保持它们运行
echo.
pause
