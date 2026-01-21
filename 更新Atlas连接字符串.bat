@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 更新 MongoDB Atlas 连接字符串
echo ========================================
echo.

REM 原始连接字符串
set "ORIGINAL_URI=mongodb+srv://TransGuyane:7TZd5SQxFjHgZ9H5@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0"

REM 修复后的连接字符串（添加数据库名称和标准参数）
REM 注意：& 需要用 ^ 转义，或者整个字符串用引号包围
set "FIXED_URI=mongodb+srv://TransGuyane:7TZd5SQxFjHgZ9H5@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true^&w=majority"

echo 原始连接字符串:
echo !ORIGINAL_URI!
echo.
echo 修复后的连接字符串（包含数据库名称和参数）:
echo !FIXED_URI!
echo.

cd /d "%~dp0backend"
if not exist ".env" (
    echo [INFO] 未找到 .env 文件，正在创建...
    (
        echo PORT=5000
        echo MONGODB_URI=!FIXED_URI!
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > .env
    echo [OK] .env 文件已创建
) else (
    echo [INFO] 正在更新现有 .env 文件...
    REM 备份
    copy .env .env.backup >nul 2>&1
    
    REM 更新 MONGODB_URI（使用延迟变量扩展避免 & 的问题）
    (
        for /f "usebackq tokens=1* delims==" %%a in (".env") do (
            set "key=%%a"
            set "value=%%b"
            if "!key!"=="MONGODB_URI" (
                echo MONGODB_URI=!FIXED_URI!
            ) else if "!key!" neq "" (
                echo !key!=!value!
            ) else (
                echo.
            )
        )
    ) > .env.tmp
    
    move /y .env.tmp .env >nul
    echo [OK] .env 文件已更新
)

echo.
echo ========================================
echo 更新完成
echo ========================================
echo.
echo 当前 MONGODB_URI 配置:
findstr /C:"MONGODB_URI" .env
echo.

echo ========================================
echo 验证配置格式
echo ========================================
echo.
findstr /C:"MONGODB_URI" .env | findstr "warehouse_management" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 包含数据库名称 (warehouse_management)
) else (
    echo [WARNING] 缺少数据库名称
)

findstr /C:"MONGODB_URI" .env | findstr "retryWrites=true" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 包含 retryWrites=true 参数
) else (
    echo [WARNING] 缺少 retryWrites=true 参数
)

findstr /C:"MONGODB_URI" .env | findstr "w=majority" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 包含 w=majority 参数
) else (
    echo [WARNING] 缺少 w=majority 参数
)

echo.
echo ========================================
echo 下一步操作
echo ========================================
echo.
echo 1. 测试数据库连接:
echo    运行: 检查云数据库配置.bat
echo.
echo 2. 创建管理员账号:
echo    运行: 创建管理员并测试登录.bat
echo.
echo 3. 启动服务:
echo    后端: 快速启动后端.bat
echo    前端: 启动前端.bat
echo.

cd ..
pause
