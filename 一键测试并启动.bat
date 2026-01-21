@echo off
chcp 65001 >nul
cls
echo ========================================
echo 一键测试并启动系统
echo ========================================
echo.
echo 此脚本将按顺序执行:
echo   1. 修复连接字符串（如需要）
echo   2. 测试数据库连接
echo   3. 创建管理员账号
echo   4. 检查服务状态
echo.
pause

cd /d "%~dp0"

echo.
echo ========================================
echo [步骤 1/4] 修复连接字符串
echo ========================================
echo.
cd backend
if not exist "node_modules" (
    echo [INFO] 安装依赖...
    call npm install >nul 2>&1
)
node scripts\fixMongoURI.js
set FIX_RESULT=%errorlevel%
cd ..

if %FIX_RESULT% neq 0 (
    echo [WARNING] 连接字符串修复可能有问题，但继续测试...
    echo.
)

echo.
echo ========================================
echo [步骤 2/4] 测试数据库连接
echo ========================================
echo.
cd backend

REM 创建测试连接脚本
echo const mongoose = require('mongoose'); > test_conn.js
echo require('dotenv').config(); >> test_conn.js
echo const uri = process.env.MONGODB_URI; >> test_conn.js
echo console.log('正在连接数据库...'); >> test_conn.js
echo console.log('连接字符串:', uri.replace(/:[^:@]+@/, ':****@')); >> test_conn.js
echo mongoose.connect(uri, { >> test_conn.js
echo   useNewUrlParser: true, >> test_conn.js
echo   useUnifiedTopology: true, >> test_conn.js
echo   serverSelectionTimeoutMS: 15000, >> test_conn.js
echo   socketTimeoutMS: 45000 >> test_conn.js
echo }).then(() =^> { >> test_conn.js
echo   console.log('[SUCCESS] MongoDB Atlas 连接成功！'); >> test_conn.js
echo   console.log('数据库:', mongoose.connection.name); >> test_conn.js
echo   mongoose.connection.close(); >> test_conn.js
echo   process.exit(0); >> test_conn.js
echo }).catch(err =^> { >> test_conn.js
echo   console.error('[ERROR] 连接失败:', err.message); >> test_conn.js
echo   process.exit(1); >> test_conn.js
echo }); >> test_conn.js

node test_conn.js
set TEST_RESULT=%errorlevel%
del test_conn.js >nul 2>&1
cd ..

if %TEST_RESULT% neq 0 (
    echo.
    echo [ERROR] 数据库连接失败
    echo 请检查:
    echo   1. MongoDB Atlas 网络访问设置（IP 白名单）
    echo   2. 连接字符串是否正确
    echo   3. 用户名和密码是否正确
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [步骤 3/4] 创建管理员账号
echo ========================================
echo.
cd backend
node scripts\createAdmin.js
set ADMIN_RESULT=%errorlevel%
cd ..

if %ADMIN_RESULT% neq 0 (
    echo.
    echo [WARNING] 管理员账号创建可能有问题
    echo 但可以继续启动服务
    echo.
) else (
    echo.
    echo [OK] 管理员账号已创建/更新
    echo 用户名: xubo327
    echo 密码: 3273279x
    echo.
)

echo.
echo ========================================
echo [步骤 4/4] 检查服务状态
echo ========================================
echo.

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 后端服务已在运行（端口 5000）
) else (
    echo [INFO] 后端服务未运行
    echo 请在新窗口运行: 快速启动后端.bat
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 前端服务已在运行（端口 3000）
) else (
    echo [INFO] 前端服务未运行
    echo 请在新窗口运行: 启动前端.bat
)

echo.
echo ========================================
echo [SUCCESS] 系统准备就绪
echo ========================================
echo.
echo 下一步操作:
echo.
echo 1. 启动后端服务（新窗口）:
echo    双击运行: 快速启动后端.bat
echo.
echo 2. 启动前端服务（另一个新窗口）:
echo    双击运行: 启动前端.bat
echo.
echo 3. 在浏览器中登录:
echo    地址: http://localhost:3000
echo    用户名: xubo327
echo    密码: 3273279x
echo.
echo ========================================
pause
