@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 修复连接字符串缺失的参数
echo ========================================
echo.

cd /d "%~dp0backend"
if not exist ".env" (
    echo [ERROR] 未找到 .env 文件
    pause
    exit /b 1
)

echo [步骤 1/3] 读取当前配置...
echo.
for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" .env') do (
    set "CURRENT_URI=%%a"
)

echo 当前连接字符串:
echo !CURRENT_URI!
echo.

echo [步骤 2/3] 修复连接字符串...
echo.

REM 检查并修复参数
set "FIXED_URI=!CURRENT_URI!"

REM 如果缺少 w=majority 参数，添加它
echo !FIXED_URI! | findstr "w=majority" >nul 2>&1
if %errorlevel% neq 0 (
    echo [修复] 添加 w=majority 参数...
    REM 替换 retryWrites=true 或 retrywrites=true 为包含 w=majority 的版本
    set "FIXED_URI=!FIXED_URI:retryWrites=true=retryWrites=true^&w=majority!"
    set "FIXED_URI=!FIXED_URI:retrywrites=true=retryWrites=true^&w=majority!"
    
    REM 如果还是没有修改成功，直接添加参数
    echo !FIXED_URI! | findstr "w=majority" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [修复] 直接添加参数到末尾...
        if "!FIXED_URI:~-1!"=="?" (
            set "FIXED_URI=!FIXED_URI!retryWrites=true^&w=majority"
        ) else (
            set "FIXED_URI=!FIXED_URI!^&w=majority"
        )
    )
) else (
    echo [OK] 连接字符串已包含 w=majority 参数
)

echo.
echo 修复后的连接字符串:
echo !FIXED_URI!
echo.

echo [步骤 3/3] 更新 .env 文件...
echo.

REM 备份
copy .env .env.backup >nul 2>&1

REM 更新文件
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
echo.

echo ========================================
echo 验证修复结果
echo ========================================
echo.
echo 更新后的 MONGODB_URI:
findstr /C:"MONGODB_URI" .env
echo.

findstr /C:"MONGODB_URI" .env | findstr "w=majority" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] 连接字符串包含 w=majority 参数
) else (
    echo [ERROR] 修复失败，请手动检查 .env 文件
)

echo.
echo ========================================
echo 修复完成
echo ========================================
echo.
echo 下一步: 测试连接
echo   运行: 检查云数据库配置.bat
echo.

cd ..
pause
