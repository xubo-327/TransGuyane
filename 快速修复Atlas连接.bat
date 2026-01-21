@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 快速修复 MongoDB Atlas 连接字符串
echo ========================================
echo.

echo 问题: 连接字符串参数缺少值
echo 错误: URI cannot contain options with no value
echo.
echo 修复: 将 ?retryWrites 改为 ?retryWrites=true^&w=majority
echo.

cd /d "%~dp0backend"
if not exist ".env" (
    echo [ERROR] 未找到 .env 文件
    echo 请先运行: 一键配置Atlas连接.bat
    pause
    exit /b 1
)

echo [步骤 1/3] 读取当前配置...
set "OLD_URI="
for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" .env') do (
    set "OLD_URI=%%a"
)

if "!OLD_URI!"=="" (
    echo [ERROR] 未找到 MONGODB_URI 配置
    pause
    exit /b 1
)

echo 当前连接字符串:
echo !OLD_URI!
echo.

echo [步骤 2/3] 修复连接字符串...
echo.

REM 检查是否包含不完整的参数
echo !OLD_URI! | findstr "retryWrites$" >nul 2>&1
if %errorlevel% equ 0 (
    echo [检测到] 连接字符串末尾的 retryWrites 缺少值
    echo [修复中] 添加参数值...
    
    REM 替换 ?retryWrites 或 &retryWrites 为完整参数
    set "NEW_URI=!OLD_URI!"
    set "NEW_URI=!NEW_URI:?retryWrites=?retryWrites=true&w=majority!"
    set "NEW_URI=!NEW_URI:&retryWrites=&retryWrites=true&w=majority!"
    
    REM 如果替换后还是原样，说明格式不同，直接替换末尾
    if "!NEW_URI!"=="!OLD_URI!" (
        set "NEW_URI=!OLD_URI:?retrywrites=?retryWrites=true&w=majority!"
    )
    if "!NEW_URI!"=="!OLD_URI!" (
        REM 完全替换为正确的格式
        set "NEW_URI=mongodb+srv://x2440221078_db_user:Pjtu69a4XqCReP1Q@cluster0.zmojow7.mongodb.net/warehouse_management?retryWrites=true&w=majority"
    )
) else (
    echo [检测] 连接字符串可能已正确，但检查参数值...
    echo !OLD_URI! | findstr "retryWrites=true" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [修复中] 参数格式不正确，修复为正确格式...
        set "NEW_URI=mongodb+srv://x2440221078_db_user:Pjtu69a4XqCReP1Q@cluster0.zmojow7.mongodb.net/warehouse_management?retryWrites=true&w=majority"
    ) else (
        echo [OK] 连接字符串格式正确，无需修复
        set "NEW_URI=!OLD_URI!"
    )
)

echo.
echo 修复后的连接字符串:
echo !NEW_URI!
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
            echo MONGODB_URI=!NEW_URI!
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
echo 修复完成
echo ========================================
echo.
echo 下一步: 测试连接
echo   运行: 检查云数据库配置.bat
echo.
echo 或直接创建管理员账号:
echo   运行: 创建管理员并测试登录.bat
echo.

cd ..
pause
