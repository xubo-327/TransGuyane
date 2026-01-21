@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 快速配置 MongoDB Atlas 云数据库
echo ========================================
echo.

echo 使用此脚本前，请先完成以下步骤:
echo   1. 访问 https://www.mongodb.com/cloud/atlas/register 注册账号
echo   2. 创建免费集群 (M0)
echo   3. 创建数据库用户并设置密码
echo   4. 配置网络访问 (允许所有 IP 或添加您的 IP)
echo   5. 获取连接字符串
echo.
echo 详细步骤请参考: MongoDB Atlas配置指南.md
echo.
pause

if not exist "backend\.env" (
    echo [INFO] 未找到 backend\.env 文件，正在创建...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > backend\.env
    echo [OK] .env 文件已创建
    echo.
)

echo 当前 MongoDB 连接配置:
findstr /C:"MONGODB_URI" backend\.env 2>nul
echo.

echo ========================================
echo 请输入 MongoDB Atlas 连接字符串
echo ========================================
echo.
echo 连接字符串格式:
echo   mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true^&w=majority
echo.
echo 示例:
echo   mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true^&w=majority
echo.
set /p atlas_uri="连接字符串: "

if "!atlas_uri!"=="" (
    echo.
    echo [ERROR] 连接字符串不能为空
    pause
    exit /b 1
)

echo.
echo 正在更新配置...

REM 使用临时文件更新 .env 文件
(
    for /f "usebackq tokens=1* delims==" %%a in ("backend\.env") do (
        set "key=%%a"
        set "value=%%b"
        if "!key!"=="MONGODB_URI" (
            echo MONGODB_URI=!atlas_uri!
        ) else if "!key!" neq "" (
            echo !key!=!value!
        ) else (
            echo.
        )
    )
) > backend\.env.tmp

move /y backend\.env.tmp backend\.env >nul

echo [OK] 配置已更新
echo.
echo 新的连接配置:
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
        call npm install >nul 2>&1
    )
    node scripts\createAdmin.js
    cd ..
    echo.
)

echo ========================================
echo 配置完成
echo ========================================
echo.
echo 下一步:
echo   1. 如果测试成功，可以启动后端服务: 快速启动后端.bat
echo   2. 如果测试失败，请检查连接字符串和网络设置
echo.
pause
