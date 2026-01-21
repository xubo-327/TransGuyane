@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   TransGuyane 数据库配置向导
echo ========================================
echo.
echo 本向导将帮助您配置 MongoDB 数据库
echo.
echo 请选择数据库类型:
echo   1. MongoDB Atlas（免费云数据库，推荐）
echo   2. 阿里云 MongoDB
echo   3. 本地 MongoDB
echo.
set /p choice="请输入选项 [1-3]: "

cd /d "%~dp0"

if "%choice%"=="1" goto atlas
if "%choice%"=="2" goto aliyun
if "%choice%"=="3" goto local
echo 无效选项
pause
exit /b 1

:atlas
cls
echo.
echo ========================================
echo   配置 MongoDB Atlas（免费云数据库）
echo ========================================
echo.
echo 请按以下步骤操作:
echo.
echo [步骤 1] 注册 MongoDB Atlas 账号
echo    访问: https://www.mongodb.com/atlas
echo    点击 "Try Free" 免费注册
echo.
echo [步骤 2] 创建免费集群
echo    - 选择 "Build a Database"
echo    - 选择 "FREE" (M0 Sandbox)
echo    - 选择最近的区域（如 Hong Kong 或 Singapore）
echo    - 点击 "Create Cluster"
echo.
echo [步骤 3] 创建数据库用户
echo    - 点击左侧 "Database Access"
echo    - 点击 "Add New Database User"
echo    - Authentication: Password
echo    - 设置用户名和密码（请记住！）
echo    - Database User Privileges: Atlas admin
echo    - 点击 "Add User"
echo.
echo [步骤 4] 配置网络访问
echo    - 点击左侧 "Network Access"
echo    - 点击 "Add IP Address"
echo    - 点击 "Allow Access from Anywhere"（或添加服务器IP）
echo    - 点击 "Confirm"
echo.
echo [步骤 5] 获取连接字符串
echo    - 点击左侧 "Database"
echo    - 点击 "Connect"
echo    - 选择 "Connect your application"
echo    - Driver: Node.js, Version: 5.5 or later
echo    - 复制连接字符串
echo.
echo ----------------------------------------
echo.
set /p MONGO_USER="请输入 MongoDB Atlas 用户名: "
set /p MONGO_PASS="请输入 MongoDB Atlas 密码: "
set /p MONGO_CLUSTER="请输入集群地址 (如 cluster0.xxxxx.mongodb.net): "

if "%MONGO_USER%"=="" goto invalid
if "%MONGO_PASS%"=="" goto invalid
if "%MONGO_CLUSTER%"=="" goto invalid

set "MONGODB_URI=mongodb+srv://%MONGO_USER%:%MONGO_PASS%@%MONGO_CLUSTER%/warehouse_management?retryWrites=true&w=majority"

goto save_config

:aliyun
cls
echo.
echo ========================================
echo   配置阿里云 MongoDB
echo ========================================
echo.
echo 请在阿里云控制台创建 MongoDB 实例后填写以下信息:
echo.
set /p MONGO_HOST="请输入 MongoDB 地址: "
set /p MONGO_PORT="请输入端口号 [默认27017]: "
set /p MONGO_USER="请输入用户名: "
set /p MONGO_PASS="请输入密码: "
set /p MONGO_DB="请输入数据库名 [默认warehouse_management]: "

if "%MONGO_PORT%"=="" set MONGO_PORT=27017
if "%MONGO_DB%"=="" set MONGO_DB=warehouse_management

if "%MONGO_HOST%"=="" goto invalid
if "%MONGO_USER%"=="" goto invalid
if "%MONGO_PASS%"=="" goto invalid

set "MONGODB_URI=mongodb://%MONGO_USER%:%MONGO_PASS%@%MONGO_HOST%:%MONGO_PORT%/%MONGO_DB%?authSource=admin"

goto save_config

:local
cls
echo.
echo ========================================
echo   配置本地 MongoDB
echo ========================================
echo.
set /p MONGO_HOST="请输入 MongoDB 地址 [默认localhost]: "
set /p MONGO_PORT="请输入端口号 [默认27017]: "
set /p MONGO_DB="请输入数据库名 [默认warehouse_management]: "

if "%MONGO_HOST%"=="" set MONGO_HOST=localhost
if "%MONGO_PORT%"=="" set MONGO_PORT=27017
if "%MONGO_DB%"=="" set MONGO_DB=warehouse_management

set "MONGODB_URI=mongodb://%MONGO_HOST%:%MONGO_PORT%/%MONGO_DB%"

goto save_config

:save_config
echo.
echo ----------------------------------------
echo 生成的连接字符串:
echo %MONGODB_URI%
echo ----------------------------------------
echo.

:: 保存到后端 .env
echo 正在保存配置...

:: 生成随机 JWT_SECRET
set "JWT_SECRET=transguyane_jwt_%RANDOM%%RANDOM%%RANDOM%"

:: 创建后端 .env
(
echo PORT=5000
echo MONGODB_URI=%MONGODB_URI%
echo JWT_SECRET=%JWT_SECRET%
echo.
echo # 微信登录配置（可选）
echo WECHAT_APPID=
echo WECHAT_SECRET=
) > backend\.env

echo [OK] 后端配置已保存到 backend\.env

:: 创建前端 .env
(
echo REACT_APP_API_URL=http://localhost:5000/api
) > frontend\.env

echo [OK] 前端配置已保存到 frontend\.env

:: 创建生产环境配置
(
echo NODE_ENV=production
echo PORT=5000
echo MONGODB_URI=%MONGODB_URI%
echo JWT_SECRET=%JWT_SECRET%
echo FRONTEND_URL=
echo WECHAT_APPID=
echo WECHAT_SECRET=
) > .env.production

echo [OK] 生产环境配置已保存到 .env.production
echo.

:: 测试连接
echo 正在测试数据库连接...
cd backend
if exist "node_modules" (
    node scripts\testConnection.js 2>nul
    if errorlevel 1 (
        echo [警告] 数据库连接测试失败，请检查配置
    ) else (
        echo [OK] 数据库连接成功！
    )
) else (
    echo [提示] 请先安装依赖后测试连接
)
cd ..
echo.

echo ========================================
echo   配置完成！
echo ========================================
echo.
echo 下一步:
echo   1. 运行 "一键部署.bat" 启动本地服务
echo   2. 或运行 "准备云部署包.bat" 准备云部署
echo.
pause
exit /b 0

:invalid
echo.
echo [错误] 输入不完整，请重新运行
pause
exit /b 1
