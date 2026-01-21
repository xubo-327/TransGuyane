@echo off
chcp 65001 >nul
cls
echo ========================================
echo 检查并启动 MongoDB 服务
echo ========================================
echo.

echo [步骤 1/4] 检查 MongoDB 服务状态...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB 服务已安装
    sc query MongoDB | findstr "RUNNING" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MongoDB 服务正在运行
        goto :check_port
    ) else (
        echo [WARNING] MongoDB 服务已安装但未运行
        goto :start_service
    )
) else (
    echo [INFO] 未找到 MongoDB Windows 服务
    echo 正在检查端口 27017 是否被占用...
    goto :check_port
)

:check_port
echo.
echo [步骤 2/4] 检查端口 27017...
netstat -ano | findstr ":27017" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 端口 27017 正在被使用，MongoDB 可能已运行
    netstat -ano | findstr ":27017"
    echo.
    echo 正在测试连接...
    goto :test_connection
) else (
    echo [WARNING] 端口 27017 未被使用
    echo MongoDB 可能未运行或未在默认端口运行
    goto :start_service
)

:start_service
echo.
echo [步骤 3/4] 尝试启动 MongoDB...
echo.
echo 请选择启动方式:
echo   1. 使用 Windows 服务启动 (如果已安装为服务)
echo   2. 手动启动 MongoDB (使用 mongod.exe)
echo   3. 跳过，稍后手动启动
echo.
set /p choice="请输入选项 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 正在尝试启动 MongoDB 服务...
    net start MongoDB 2>nul
    if %errorlevel% equ 0 (
        echo [OK] MongoDB 服务启动成功
        timeout /t 2 >nul
        goto :test_connection
    ) else (
        echo [ERROR] 无法启动 MongoDB 服务
        echo 可能需要管理员权限，或者服务未正确安装
        echo.
        echo 请尝试手动启动:
        echo   1. 以管理员身份运行此脚本
        echo   2. 或手动运行: net start MongoDB
        echo   3. 或直接运行 mongod.exe
        goto :manual_guide
    )
) else if "%choice%"=="2" (
    echo.
    echo 请手动启动 MongoDB:
    echo   1. 打开新的命令提示符窗口
    echo   2. 导航到 MongoDB 安装目录的 bin 文件夹
    echo   3. 运行: mongod.exe
    echo.
    echo 或者在 MongoDB 安装目录中找到 mongod.exe 并双击运行
    goto :manual_guide
) else (
    goto :manual_guide
)

:test_connection
echo.
echo [步骤 4/4] 测试 MongoDB 连接...
cd backend
if not exist "node_modules" (
    echo [WARNING] 后端依赖未安装，正在安装...
    call npm install >nul 2>&1
)
if not exist "models\User.js" (
    echo [ERROR] 找不到 User 模型文件
    cd ..
    pause
    exit /b 1
)

node -e "const mongoose=require('mongoose');require('dotenv').config();(async()=>{try{console.log('正在连接数据库...');const uri=process.env.MONGODB_URI||'mongodb://localhost:27017/warehouse_management';await mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true,serverSelectionTimeoutMS:3000});console.log('[OK] MongoDB 连接成功！');await mongoose.connection.close();process.exit(0);}catch(e){console.error('[ERROR]',e.message);if(e.message.includes('connect')||e.message.includes('ECONNREFUSED')){console.error('无法连接到 MongoDB');console.error('请确保 MongoDB 服务已启动');}process.exit(1);}})();"
set TEST_RESULT=%errorlevel%
cd ..

echo.
if %TEST_RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] MongoDB 连接测试通过
    echo ========================================
    echo.
    echo 现在可以:
    echo   1. 启动后端服务: cd backend ^&^& npm run dev
    echo   2. 启动前端服务: cd frontend ^&^& npm start
    echo   3. 创建管理员账号: cd backend ^&^& node scripts\createAdmin.js
    echo.
) else (
    echo ========================================
    echo [ERROR] MongoDB 连接失败
    echo ========================================
    goto :manual_guide
)

pause
exit /b 0

:manual_guide
echo.
echo ========================================
echo MongoDB 启动指南
echo ========================================
echo.
echo 如果 MongoDB 未安装:
echo   1. 下载 MongoDB: https://www.mongodb.com/try/download/community
echo   2. 安装时选择 "Install MongoDB as a Service"
echo   3. 安装完成后重启此脚本
echo.
echo 如果 MongoDB 已安装但未运行:
echo   1. 打开任务管理器，检查是否有 mongod.exe 进程
echo   2. 如果没有，以管理员身份运行:
echo      net start MongoDB
echo   3. 或者手动运行 mongod.exe (通常在 MongoDB\bin 目录)
echo.
echo 常见 MongoDB 安装路径:
echo   C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
echo   C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
echo.
pause
exit /b 1
