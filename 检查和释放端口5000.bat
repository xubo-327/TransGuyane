@echo off
chcp 65001 >nul
cls
echo ========================================
echo 检查和释放端口 5000
echo ========================================
echo.

echo [步骤 1/3] 检查端口 5000 占用情况...
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% neq 0 (
    echo [OK] 端口 5000 未被占用，可以正常启动后端服务
    echo.
    pause
    exit /b 0
)

echo [WARNING] 端口 5000 已被占用
echo.
echo 占用端口的进程信息:
netstat -ano | findstr ":5000"
echo.

echo [步骤 2/3] 查找进程详情...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    set "PID=%%a"
    goto :found_pid
)

:found_pid
if not defined PID (
    echo [ERROR] 无法确定进程 ID
    pause
    exit /b 1
)

echo 进程 ID (PID): %PID%
echo.
tasklist /FI "PID eq %PID%" 2>nul | findstr /V "INFO:" | findstr /V "="

echo.
echo [步骤 3/3] 选择操作:
echo.
echo   1. 结束占用端口的进程 (推荐)
echo   2. 更改后端端口为其他端口 (如 5001)
echo   3. 取消操作
echo.
set /p choice="请选择 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 正在结束进程 %PID%...
    taskkill /PID %PID% /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] 进程已结束
        timeout /t 2 >nul
        echo.
        echo 现在可以启动后端服务了
        echo 运行: 快速启动后端.bat
    ) else (
        echo [ERROR] 无法结束进程，可能需要管理员权限
        echo.
        echo 请尝试:
        echo   1. 以管理员身份运行此脚本
        echo   2. 或手动结束进程: taskkill /PID %PID% /F
        echo   3. 或更改后端端口
    )
) else if "%choice%"=="2" (
    echo.
    echo 请手动修改 backend\.env 文件
    echo 将 PORT=5000 改为 PORT=5001 (或其他可用端口)
    echo.
    echo 然后记得也要修改 frontend\.env 中的 API URL
    echo 例如: REACT_APP_API_URL=http://localhost:5001/api
    echo.
) else (
    echo.
    echo 操作已取消
    echo.
)

echo.
pause
