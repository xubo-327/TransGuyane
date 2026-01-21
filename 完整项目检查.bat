@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 完整项目检查
echo ========================================
echo.

cd /d "%~dp0"

echo [检查 1/10] 项目结构...
if exist "backend" (
    echo [OK] backend 目录存在
) else (
    echo [ERROR] backend 目录不存在
    set ERRORS=1
)

if exist "frontend" (
    echo [OK] frontend 目录存在
) else (
    echo [ERROR] frontend 目录不存在
    set ERRORS=1
)
echo.

echo [检查 2/10] 后端核心文件...
if exist "backend\server.js" (
    echo [OK] server.js 存在
) else (
    echo [ERROR] server.js 不存在
    set ERRORS=1
)

if exist "backend\package.json" (
    echo [OK] package.json 存在
) else (
    echo [ERROR] package.json 不存在
    set ERRORS=1
)

if exist "backend\.env" (
    echo [OK] .env 文件存在
) else (
    echo [WARNING] .env 文件不存在
)

if exist "backend\node_modules" (
    echo [OK] 后端依赖已安装
) else (
    echo [WARNING] 后端依赖未安装
)
echo.

echo [检查 3/10] 后端路由文件...
set ROUTE_FILES=auth.js orders.js batches.js messages.js users.js export.js
for %%f in (%ROUTE_FILES%) do (
    if exist "backend\routes\%%f" (
        echo [OK] routes\%%f 存在
    ) else (
        echo [ERROR] routes\%%f 不存在
        set ERRORS=1
    )
)
echo.

echo [检查 4/10] 后端模型文件...
set MODEL_FILES=User.js Order.js Batch.js Message.js
for %%f in (%MODEL_FILES%) do (
    if exist "backend\models\%%f" (
        echo [OK] models\%%f 存在
    ) else (
        echo [ERROR] models\%%f 不存在
        set ERRORS=1
    )
)
echo.

echo [检查 5/10] 后端中间件...
if exist "backend\middleware\auth.js" (
    echo [OK] middleware\auth.js 存在
) else (
    echo [ERROR] middleware\auth.js 不存在
    set ERRORS=1
)
echo.

echo [检查 6/10] 后端脚本...
if exist "backend\scripts\createAdmin.js" (
    echo [OK] scripts\createAdmin.js 存在
) else (
    echo [WARNING] scripts\createAdmin.js 不存在
)
echo.

echo [检查 7/10] 前端核心文件...
if exist "frontend\package.json" (
    echo [OK] package.json 存在
) else (
    echo [ERROR] package.json 不存在
    set ERRORS=1
)

if exist "frontend\src\App.js" (
    echo [OK] App.js 存在
) else (
    echo [ERROR] App.js 不存在
    set ERRORS=1
)

if exist "frontend\.env" (
    echo [OK] .env 文件存在
) else (
    echo [WARNING] .env 文件不存在
)

if exist "frontend\node_modules" (
    echo [OK] 前端依赖已安装
) else (
    echo [WARNING] 前端依赖未安装
)
echo.

echo [检查 8/10] 前端服务文件...
if exist "frontend\src\services\api.js" (
    echo [OK] services\api.js 存在
) else (
    echo [ERROR] services\api.js 不存在
    set ERRORS=1
)

if exist "frontend\src\contexts\AuthContext.js" (
    echo [OK] contexts\AuthContext.js 存在
) else (
    echo [ERROR] contexts\AuthContext.js 不存在
    set ERRORS=1
)
echo.

echo [检查 9/10] 前端页面文件...
if exist "frontend\src\pages\Login.js" (
    echo [OK] pages\Login.js 存在
) else (
    echo [ERROR] pages\Login.js 不存在
    set ERRORS=1
)

if exist "frontend\src\pages\Register.js" (
    echo [OK] pages\Register.js 存在
) else (
    echo [ERROR] pages\Register.js 不存在
    set ERRORS=1
)
echo.

echo [检查 10/10] 环境变量配置...
echo.
echo 检查后端 .env 配置...
if exist "backend\.env" (
    findstr /C:"MONGODB_URI" backend\.env >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] MONGODB_URI 已配置
        for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" backend\.env') do (
            echo   值: %%a | findstr /V "mongodb" | findstr "." >nul 2>&1
            if !errorlevel! equ 0 (
                echo [OK] 连接字符串格式正确
            ) else (
                echo %%a | findstr "mongodb+srv://" >nul 2>&1
                if !errorlevel! equ 0 (
                    echo [OK] MongoDB Atlas 连接字符串
                ) else (
                    echo [INFO] 本地 MongoDB 连接字符串
                )
            )
        )
    ) else (
        echo [WARNING] MONGODB_URI 未配置
    )
    
    findstr /C:"JWT_SECRET" backend\.env >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] JWT_SECRET 已配置
    ) else (
        echo [WARNING] JWT_SECRET 未配置
    )
    
    findstr /C:"PORT" backend\.env >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] PORT 已配置
    ) else (
        echo [INFO] PORT 使用默认值 5000
    )
) else (
    echo [WARNING] backend\.env 文件不存在
)
echo.

echo 检查前端 .env 配置...
if exist "frontend\.env" (
    findstr /C:"REACT_APP_API_URL" frontend\.env >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] REACT_APP_API_URL 已配置
        for /f "tokens=2 delims==" %%a in ('findstr /C:"REACT_APP_API_URL" frontend\.env') do (
            if "%%a"=="http://localhost:5000/api" (
                echo [OK] API URL 配置正确
            ) else (
                echo [WARNING] API URL: %%a
            )
        )
    ) else (
        echo [WARNING] REACT_APP_API_URL 未配置
        echo [INFO] 将使用默认值: http://localhost:5000/api
    )
) else (
    echo [WARNING] frontend\.env 文件不存在
    echo [INFO] 将使用默认值: http://localhost:5000/api
)
echo.

echo ========================================
echo 服务状态检查
echo ========================================
echo.

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 后端服务正在运行（端口 5000）
) else (
    echo [INFO] 后端服务未运行
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 前端服务正在运行（端口 3000）
) else (
    echo [INFO] 前端服务未运行
)
echo.

echo ========================================
echo 检查结果总结
echo ========================================
echo.

if defined ERRORS (
    echo [ERROR] 发现文件缺失问题
    echo 请检查上述错误信息
) else (
    echo [SUCCESS] 所有核心文件检查通过
)

echo.
echo 建议操作:
echo   1. 如果缺少依赖，运行安装脚本
echo   2. 如果缺少 .env 文件，运行配置脚本
echo   3. 启动服务: 快速启动后端.bat 和 启动前端.bat
echo.

pause
