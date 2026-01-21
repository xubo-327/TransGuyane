@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 验证并修复 MongoDB Atlas 连接字符串
echo ========================================
echo.

cd /d "%~dp0backend"
if not exist ".env" (
    echo [ERROR] 未找到 .env 文件
    pause
    exit /b 1
)

echo [步骤 1/3] 读取 .env 文件中的实际内容...
echo.
echo 当前 MONGODB_URI 的值:
for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" .env') do (
    set "ACTUAL_URI=%%a"
    echo !ACTUAL_URI!
)

echo.
echo [步骤 2/3] 检查连接字符串格式...
echo.

REM 检查是否有问题
echo !ACTUAL_URI! | findstr "retrywrites$" >nul 2>&1
if %errorlevel% equ 0 (
    echo [检测到] 连接字符串末尾只有 retrywrites，缺少值和 w=majority
    echo [修复] 更新为正确格式...
    set "NEEDS_FIX=1"
) else (
    echo !ACTUAL_URI! | findstr "retryWrites=true^&w=majority" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [检测到] 连接字符串格式不正确
        set "NEEDS_FIX=1"
    ) else (
        echo [OK] 连接字符串格式正确
        set "NEEDS_FIX=0"
    )
)

if "!NEEDS_FIX!"=="1" (
    echo.
    echo [步骤 3/3] 修复连接字符串...
    echo.
    
    REM 正确的连接字符串
    set "CORRECT_URI=mongodb+srv://TransGuyane:7TZd5SQxFjHgZ9H5@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority"
    
    echo 正确的连接字符串:
    echo !CORRECT_URI!
    echo.
    
    REM 备份
    copy .env .env.backup >nul 2>&1
    
    REM 读取并更新文件
    (
        for /f "usebackq tokens=1* delims==" %%a in (".env") do (
            set "key=%%a"
            set "value=%%b"
            if "!key!"=="MONGODB_URI" (
                echo MONGODB_URI=!CORRECT_URI!
            ) else if "!key!" neq "" (
                echo !key!=!value!
            ) else (
                echo.
            )
        )
    ) > .env.tmp
    
    move /y .env.tmp .env >nul
    
    echo [OK] .env 文件已更新
    echo.
    
    echo 更新后的 MONGODB_URI:
    findstr /C:"MONGODB_URI" .env
    echo.
    
) else (
    echo.
    echo [步骤 3/3] 无需修复，格式已正确
)

echo.
echo ========================================
echo 验证完成
echo ========================================
echo.
echo 下一步: 测试连接
echo   运行: 检查云数据库配置.bat
echo.

cd ..
pause
