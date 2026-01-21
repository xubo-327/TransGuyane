@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 全面诊断并修复登录问题
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/5] 检查后端服务...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 后端服务正在运行
    set BACKEND_OK=1
) else (
    echo [ERROR] 后端服务未运行
    echo 请先运行: 快速启动后端.bat
    set BACKEND_OK=0
)
echo.

echo [步骤 2/5] 修复前端 API 配置...
cd frontend
if not exist ".env" (
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] 已创建 .env 文件
) else (
    findstr /C:"REACT_APP_API_URL" .env >nul 2>&1
    if !errorlevel! neq 0 (
        echo REACT_APP_API_URL=http://localhost:5000/api >> .env
        echo [OK] 已添加 API URL 配置
    ) else (
        REM 更新为正确格式
        (
            for /f "usebackq tokens=1* delims==" %%a in (".env") do (
                set "key=%%a"
                set "value=%%b"
                if "!key!"=="REACT_APP_API_URL" (
                    echo REACT_APP_API_URL=http://localhost:5000/api
                ) else if "!key!" neq "" (
                    echo !key!=!value!
                ) else (
                    echo.
                )
            )
        ) > .env.tmp
        move /y .env.tmp .env >nul
        echo [OK] API 配置已更新
    )
)
echo 当前配置:
findstr /C:"REACT_APP_API_URL" .env
cd ..
echo.

echo [步骤 3/5] 验证管理员账号...
cd backend
if not exist "node_modules" (
    call npm install >nul 2>&1
)
node scripts\createAdmin.js >nul 2>&1
set ADMIN_OK=!errorlevel!
cd ..
if !ADMIN_OK! equ 0 (
    echo [OK] 管理员账号已就绪
) else (
    echo [WARNING] 管理员账号可能有问题
)
echo.

echo [步骤 4/5] 测试后端 API...
if !BACKEND_OK! equ 1 (
    timeout /t 2 /nobreak >nul
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 3 -UseBasicParsing; Write-Host '[OK] 后端 API 正常' } catch { Write-Host '[ERROR] 后端 API 无响应' }" 2>nul
) else (
    echo [SKIP] 后端服务未运行
)
echo.

echo [步骤 5/5] 检查前端服务...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] 前端服务正在运行
    echo [重要] 由于修改了 .env 文件，需要重启前端服务
    echo 请停止前端服务（Ctrl+C），然后重新运行: 启动前端.bat
) else (
    echo [INFO] 前端服务未运行
    echo 可以运行: 启动前端.bat
)
echo.

echo ========================================
echo 诊断完成
echo ========================================
echo.
if !BACKEND_OK! equ 0 (
    echo [必须] 请先启动后端服务:
    echo   双击运行: 快速启动后端.bat
    echo.
)

echo [重要] 修改 .env 后必须重启前端服务
echo.
echo 操作步骤:
echo 1. 如果前端正在运行，先停止（Ctrl+C）
echo 2. 重新启动前端: 启动前端.bat
echo 3. 等待前端编译完成
echo 4. 在浏览器中重新登录
echo.
echo 登录信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.

pause
