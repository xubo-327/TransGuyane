@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   TransGuyane 快速数据库配置
echo ========================================
echo.
echo 请先在 MongoDB Atlas 获取连接字符串
echo 访问: https://www.mongodb.com/atlas
echo.
echo 连接字符串格式示例:
echo mongodb+srv://用户名:密码@cluster0.xxx.mongodb.net/warehouse_management?retryWrites=true^&w=majority
echo.
echo ----------------------------------------
echo.

cd /d "%~dp0"

set /p MONGODB_URI="请粘贴完整的 MongoDB 连接字符串: "

if "%MONGODB_URI%"=="" (
    echo [错误] 连接字符串不能为空
    pause
    exit /b 1
)

:: 检查是否包含数据库名
echo %MONGODB_URI% | findstr /C:"warehouse_management" >nul
if errorlevel 1 (
    echo.
    echo [警告] 连接字符串可能缺少数据库名
    echo 正在自动添加 warehouse_management...
    
    :: 尝试在 mongodb.net/ 后添加数据库名
    set "MONGODB_URI=%MONGODB_URI:mongodb.net/?=mongodb.net/warehouse_management?%"
    set "MONGODB_URI=%MONGODB_URI:mongodb.net?=mongodb.net/warehouse_management?%"
)

echo.
echo 配置的连接字符串:
echo %MONGODB_URI%
echo.

:: 生成随机 JWT_SECRET
set "JWT_SECRET=transguyane_jwt_%RANDOM%%RANDOM%%RANDOM%_%DATE:~0,4%%TIME:~0,2%%TIME:~3,2%"

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

echo [OK] 后端配置已保存

:: 创建前端 .env
(
echo REACT_APP_API_URL=http://localhost:5000/api
) > frontend\.env

echo [OK] 前端配置已保存

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

echo [OK] 生产环境配置已保存
echo.

:: 测试连接
echo ----------------------------------------
echo 正在测试数据库连接...
echo ----------------------------------------
cd backend

if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install --registry=https://registry.npmmirror.com >nul 2>&1
)

node scripts\testConnection.js
set TEST_RESULT=%errorlevel%
cd ..

echo.
if %TEST_RESULT%==0 (
    echo ========================================
    echo   数据库配置成功！
    echo ========================================
    echo.
    echo 下一步操作:
    echo   1. 运行 "一键部署.bat" 启动本地服务
    echo   2. 或运行 "准备云部署包.bat" 准备阿里云部署
    echo.
) else (
    echo ========================================
    echo   数据库连接失败
    echo ========================================
    echo.
    echo 请检查:
    echo   1. MongoDB Atlas 网络访问是否允许所有IP (0.0.0.0/0)
    echo   2. 用户名和密码是否正确
    echo   3. 连接字符串格式是否正确
    echo.
    echo 详细说明请查看: 数据库配置指南.md
    echo.
)

pause
