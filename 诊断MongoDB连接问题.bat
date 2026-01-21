@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 诊断 MongoDB 连接问题
echo ========================================
echo.

cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] 找不到 backend 目录
    pause
    exit /b 1
)

echo [步骤 1/4] 检查 .env 文件...
echo.
if not exist ".env" (
    echo [ERROR] 未找到 .env 文件
    echo 正在创建默认配置...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > .env
    echo [OK] .env 文件已创建（默认使用本地MongoDB）
    echo [提示] 如需使用云数据库，请运行: 一键配置Atlas连接.bat
    echo.
) else (
    echo [OK] .env 文件存在
)

echo [步骤 2/4] 检查 MONGODB_URI 配置...
echo.
findstr /C:"MONGODB_URI" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] .env 文件中未找到 MONGODB_URI
    echo 正在添加默认配置...
    echo MONGODB_URI=mongodb://localhost:27017/warehouse_management >> .env
    echo [OK] 已添加 MONGODB_URI 配置
) else (
    echo [OK] MONGODB_URI 配置已存在
)

echo.
echo 当前 MONGODB_URI 配置:
findstr /C:"MONGODB_URI" .env
echo.

echo [步骤 3/4] 检查连接字符串格式...
echo.
findstr /C:"MONGODB_URI" .env | findstr "mongodb+srv://" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 检测到 MongoDB Atlas 云数据库连接
    echo.
    echo Atlas 连接要求:
    echo   1. 连接字符串格式正确（包含数据库名称）
    echo   2. 网络访问 IP 白名单已配置
    echo   3. 数据库用户已创建且有权限
    echo   4. 网络连接正常
    echo.
    set "IS_ATLAS=1"
) else (
    echo [INFO] 检测到本地 MongoDB 连接
    echo.
    echo 本地 MongoDB 要求:
    echo   1. MongoDB 服务已安装并运行
    echo   2. 端口 27017 可访问
    echo.
    set "IS_ATLAS=0"
)

echo [步骤 4/4] 测试数据库连接...
echo.

if not exist "node_modules" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install >nul 2>&1
)

echo 正在尝试连接数据库...
echo.

REM 创建测试连接脚本
echo const mongoose = require('mongoose'); > test_connection.js
echo require('dotenv').config(); >> test_connection.js
echo const mongoUri = process.env.MONGODB_URI ^|^| 'mongodb://localhost:27017/warehouse_management'; >> test_connection.js
echo const isAtlas = mongoUri.includes('mongodb+srv://'); >> test_connection.js
echo console.log('连接字符串:', mongoUri.replace(/:[^:@]+@/, ':****@')); >> test_connection.js
echo console.log('连接类型:', isAtlas ? 'MongoDB Atlas (云数据库)' : '本地 MongoDB'); >> test_connection.js
echo console.log(''); >> test_connection.js
echo console.log('正在连接...'); >> test_connection.js
echo mongoose.connect(mongoUri, { >> test_connection.js
echo   useNewUrlParser: true, >> test_connection.js
echo   useUnifiedTopology: true, >> test_connection.js
echo   serverSelectionTimeoutMS: isAtlas ? 15000 : 5000, >> test_connection.js
echo   socketTimeoutMS: isAtlas ? 45000 : 45000, >> test_connection.js
echo }).then(() =^> { >> test_connection.js
echo   console.log('[SUCCESS] 数据库连接成功！'); >> test_connection.js
echo   process.exit(0); >> test_connection.js
echo }).catch(err =^> { >> test_connection.js
echo   console.error('[ERROR] 数据库连接失败:'); >> test_connection.js
echo   console.error('  错误信息:', err.message); >> test_connection.js
echo   if (isAtlas) { >> test_connection.js
echo     console.error(''); >> test_connection.js
echo     console.error('Atlas 连接故障排查:'); >> test_connection.js
echo     console.error('  1. 检查连接字符串是否正确（包含数据库名称）'); >> test_connection.js
echo     console.error('  2. 检查 MongoDB Atlas 网络访问设置（IP 白名单）'); >> test_connection.js
echo     console.error('  3. 检查数据库用户名和密码是否正确'); >> test_connection.js
echo     console.error('  4. 检查网络连接是否正常'); >> test_connection.js
echo   } else { >> test_connection.js
echo     console.error(''); >> test_connection.js
echo     console.error('本地 MongoDB 故障排查:'); >> test_connection.js
echo     console.error('  1. 确保 MongoDB 服务已启动'); >> test_connection.js
echo     console.error('  2. 检查端口 27017 是否可访问'); >> test_connection.js
echo     console.error('  3. 如需使用云数据库，运行: 一键配置Atlas连接.bat'); >> test_connection.js
echo   } >> test_connection.js
echo   process.exit(1); >> test_connection.js
echo }); >> test_connection.js

node test_connection.js
set CONN_RESULT=%errorlevel%

del test_connection.js >nul 2>&1

echo.
if %CONN_RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] 数据库连接测试通过
    echo ========================================
    echo.
    echo 现在可以创建管理员账号:
    echo   运行: 创建管理员并测试登录.bat
    echo.
) else (
    echo ========================================
    echo [ERROR] 数据库连接测试失败
    echo ========================================
    echo.
    if "!IS_ATLAS!"=="1" (
        echo 解决方案:
        echo   1. 检查 MongoDB Atlas 连接字符串是否正确
        echo   2. 确保连接字符串包含数据库名称
        echo     格式: mongodb+srv://用户:密码@集群/数据库名?参数
        echo   3. 运行: 一键配置Atlas连接.bat 重新配置
        echo   4. 检查 Atlas 网络访问设置（IP 白名单）
        echo.
    ) else (
        echo 解决方案:
        echo   1. 启动本地 MongoDB 服务
        echo   2. 或配置云数据库: 一键配置Atlas连接.bat
        echo.
    )
)

cd ..
pause
