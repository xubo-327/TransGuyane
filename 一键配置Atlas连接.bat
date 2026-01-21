@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 一键配置 MongoDB Atlas 连接
echo ========================================
echo.

REM 从 Atlas 获取的连接字符串（原始）
set "ORIGINAL_URI=mongodb+srv://x2440221078_db_user:Pjtu69a4XqCReP1Q@cluster0.zmojow7.mongodb.net/?appName=Cluster0"

REM 修改为正确的格式（添加数据库名称和标准参数）
set "FINAL_URI=mongodb+srv://x2440221078_db_user:Pjtu69a4XqCReP1Q@cluster0.zmojow7.mongodb.net/warehouse_management?retryWrites=true&w=majority"

echo 原始连接字符串:
echo %ORIGINAL_URI%
echo.
echo 修改后的连接字符串（包含数据库名称）:
echo %FINAL_URI%
echo.

if not exist "backend\.env" (
    echo [INFO] 未找到 backend\.env 文件，正在创建...
    (
        echo PORT=5000
        echo MONGODB_URI=%FINAL_URI%
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > backend\.env
    echo [OK] .env 文件已创建
) else (
    echo [INFO] 正在更新现有 .env 文件...
    REM 读取现有文件并更新 MONGODB_URI
    (
        for /f "usebackq tokens=1* delims==" %%a in ("backend\.env") do (
            set "key=%%a"
            set "value=%%b"
            if "!key!"=="MONGODB_URI" (
                echo MONGODB_URI=%FINAL_URI%
            ) else if "!key!" neq "" (
                echo !key!=!value!
            ) else (
                echo.
            )
        )
    ) > backend\.env.tmp
    move /y backend\.env.tmp backend\.env >nul
    echo [OK] .env 文件已更新
)

echo.
echo ========================================
echo 配置结果
echo ========================================
echo.
echo 当前 MONGODB_URI 配置:
findstr /C:"MONGODB_URI" backend\.env
echo.

echo ========================================
echo 测试连接
echo ========================================
echo.
set /p test_conn="是否现在测试连接? (Y/N): "

if /i "!test_conn!"=="Y" (
    echo.
    echo 正在测试连接...
    cd backend
    
    if not exist "node_modules" (
        echo [INFO] 依赖未安装，正在安装...
        call npm install
        if !errorlevel! neq 0 (
            echo [ERROR] 依赖安装失败
            cd ..
            pause
            exit /b 1
        )
    )
    
    echo.
    echo 正在连接数据库...
    node scripts\createAdmin.js
    
    cd ..
    echo.
)

echo ========================================
echo 配置完成
echo ========================================
echo.
echo 下一步操作:
echo   1. 如果连接测试成功，可以启动后端服务
echo   2. 启动后端: 运行 快速启动后端.bat
echo   3. 启动前端: 运行 启动前端.bat
echo.
pause
exit /b 0
