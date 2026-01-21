@echo off
chcp 65001 >nul
cls
title TransGuyane 一键部署

echo.
echo  ████████╗██████╗  █████╗ ███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗   ██╗ █████╗ ███╗   ██╗███████╗
echo  ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝ ██║   ██║╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝
echo     ██║   ██████╔╝███████║██╔██╗ ██║███████╗██║  ███╗██║   ██║ ╚████╔╝ ███████║██╔██╗ ██║█████╗  
echo     ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██║   ██║██║   ██║  ╚██╔╝  ██╔══██║██║╚██╗██║██╔══╝  
echo     ██║   ██║  ██║██║  ██║██║ ╚████║███████║╚██████╔╝╚██████╔╝   ██║   ██║  ██║██║ ╚████║███████╗
echo     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝
echo.
echo                         中国——法圭跨境物流运输管理系统
echo.
echo ================================================================================================
echo                                    一键部署脚本
echo ================================================================================================
echo.

cd /d "%~dp0"

echo [1/7] 检查 Node.js 环境...
echo ------------------------------------------------------------------------------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo.
    echo 下载地址: https://nodejs.org/
    echo 推荐版本: 18.x LTS 或更高
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js 版本: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm 版本: %NPM_VERSION%
echo.

echo [2/7] 创建配置文件...
echo ------------------------------------------------------------------------------------------------

:: 创建后端 .env
if not exist "backend\.env" (
    echo PORT=5000> "backend\.env"
    echo MONGODB_URI=mongodb://localhost:27017/warehouse_management>> "backend\.env"
    echo JWT_SECRET=transguyane_jwt_secret_key_2024>> "backend\.env"
    echo.>> "backend\.env"
    echo # 微信登录配置（可选）>> "backend\.env"
    echo WECHAT_APPID=your_appid>> "backend\.env"
    echo WECHAT_SECRET=your_secret>> "backend\.env"
    echo [OK] 后端配置文件已创建
) else (
    echo [OK] 后端配置文件已存在
)

:: 创建前端 .env
if not exist "frontend\.env" (
    echo REACT_APP_API_URL=http://localhost:5000/api> "frontend\.env"
    echo [OK] 前端配置文件已创建
) else (
    echo [OK] 前端配置文件已存在
)
echo.

echo [3/7] 安装后端依赖...
echo ------------------------------------------------------------------------------------------------
cd backend
if not exist "node_modules" (
    echo 正在安装后端依赖，请稍候...
    call npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo [警告] 使用淘宝镜像安装失败，尝试默认源...
        call npm install
    )
) else (
    echo [OK] 后端依赖已安装
)
cd ..
echo.

echo [4/7] 安装前端依赖...
echo ------------------------------------------------------------------------------------------------
cd frontend
if not exist "node_modules" (
    echo 正在安装前端依赖，请稍候（可能需要几分钟）...
    call npm install --legacy-peer-deps --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo [警告] 使用淘宝镜像安装失败，尝试默认源...
        call npm install --legacy-peer-deps
    )
) else (
    echo [OK] 前端依赖已安装
)
cd ..
echo.

echo [5/7] 创建管理员账号...
echo ------------------------------------------------------------------------------------------------
cd backend
node scripts\createAdmin.js 2>nul
if errorlevel 1 (
    echo [提示] 管理员账号将在后端启动后自动创建
) else (
    echo [OK] 管理员账号已就绪
)
cd ..
echo.

echo [6/7] 检查端口占用...
echo ------------------------------------------------------------------------------------------------
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [警告] 端口 5000 已被占用，后端可能无法启动
    echo [提示] 请关闭占用端口的程序后重试
) else (
    echo [OK] 端口 5000 可用
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [警告] 端口 3000 已被占用，前端可能无法启动
) else (
    echo [OK] 端口 3000 可用
)
echo.

echo [7/7] 启动服务...
echo ================================================================================================
echo.
echo 即将启动后端和前端服务...
echo.
echo 管理员登录信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.
echo 访问地址:
echo   前端: http://localhost:3000
echo   后端: http://localhost:5000/api
echo.
echo ================================================================================================
echo.

:: 启动后端（新窗口）
echo 正在启动后端服务...
start "TransGuyane 后端服务" cmd /k "cd /d "%~dp0backend" && title TransGuyane 后端服务 && echo 正在启动后端... && npm run dev"

:: 等待后端启动
echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

:: 启动前端（新窗口）
echo 正在启动前端服务...
start "TransGuyane 前端服务" cmd /k "cd /d "%~dp0frontend" && title TransGuyane 前端服务 && echo 正在启动前端... && npm start"

echo.
echo ================================================================================================
echo                              部署完成！
echo ================================================================================================
echo.
echo 两个服务窗口已启动：
echo   - [后端服务] 等待显示 "服务器运行在端口 5000"
echo   - [前端服务] 等待显示 "Compiled successfully!"
echo.
echo 浏览器将自动打开 http://localhost:3000
echo.
echo 如果浏览器未自动打开，请手动访问: http://localhost:3000
echo.
echo 提示: 
echo   - 请勿关闭两个服务窗口
echo   - 关闭此窗口不会影响服务运行
echo   - 如需停止服务，请关闭对应的服务窗口
echo.
pause
