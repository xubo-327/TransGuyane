@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 清理并修复 MongoDB Atlas 连接字符串
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

echo 当前连接字符串（可能格式错误）:
echo !CURRENT_URI!
echo.

echo [步骤 2/3] 清理并修复连接字符串...
echo.

REM 提取基础连接信息（用户名、密码、集群地址）
REM 格式: mongodb+srv://用户名:密码@集群地址/数据库名?参数

REM 直接设置为正确的格式
set "CLEAN_URI=mongodb+srv://TransGuyane:7TZd5SQxFjHgZ9H5@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority"

echo 清理后的正确连接字符串:
echo !CLEAN_URI!
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
            echo MONGODB_URI=!CLEAN_URI!
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

REM 验证各个部分
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
if !errorlevel! equ 0 (
    echo [OK] 包含 w=majority 参数
) else (
    echo [WARNING] 缺少 w=majority 参数
)

REM 检查是否有多余的字符
findstr /C:"MONGODB_URI" .env | findstr "true=true" >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARNING] 连接字符串可能仍包含错误格式
) else (
    echo [OK] 连接字符串格式正确
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
