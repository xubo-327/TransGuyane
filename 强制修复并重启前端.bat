@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 强制修复并重启前端服务
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/4] 检查并修复前端 .env 配置...
cd frontend

REM 确保 .env 文件存在且配置正确
echo REACT_APP_API_URL=http://localhost:5000/api > .env

echo [OK] .env 文件已设置为:
type .env
cd ..
echo.

echo [步骤 2/4] 停止前端服务（如果正在运行）...
tasklist /FI "IMAGENAME eq node.exe" | findstr "node.exe" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] 发现 Node.js 进程
    echo 请手动关闭前端服务窗口（按 Ctrl+C）
    echo.
    timeout /t 3 /nobreak >nul
) else (
    echo [INFO] 未发现前端服务进程
)
echo.

echo [步骤 3/4] 清除可能的缓存...
cd frontend
if exist "node_modules\.cache" (
    echo [INFO] 清除 React 缓存...
    rd /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] 缓存已清除
)
cd ..
echo.

echo [步骤 4/4] 准备启动前端服务...
echo.
echo ========================================
echo [重要提示]
echo ========================================
echo.
echo 1. .env 文件已修复为正确配置
echo 2. 现在需要重新启动前端服务
echo.
echo 请执行以下操作:
echo   1. 关闭浏览器中所有 localhost:3000 的标签页
echo   2. 如果有前端服务窗口，关闭它
echo   3. 运行: 启动前端.bat
echo   4. 等待前端编译完成（看到 Compiled successfully）
echo   5. 重新打开浏览器访问: http://localhost:3000
echo.
echo 如果仍有问题，请清除浏览器缓存:
echo   按 Ctrl+Shift+Delete 清除缓存
echo   或按 Ctrl+F5 强制刷新页面
echo.
echo ========================================
echo.
echo 是否现在启动前端服务? (Y/N)
set /p start_now="请选择: "

if /i "!start_now!"=="Y" (
    echo.
    echo 正在启动前端服务...
    echo.
    cd frontend
    call npm start
) else (
    echo.
    echo 请稍后手动运行: 启动前端.bat
    echo.
)

pause
