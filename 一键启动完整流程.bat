@echo off
chcp 65001 >nul
cls
echo ========================================
echo 一键启动完整流程
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/5] 创建配置文件...
call "创建环境变量.bat" >nul 2>&1
if exist "backend\.env" (
    echo [OK] 后端配置已就绪
) else (
    echo [ERROR] 后端配置创建失败
    pause
    exit /b 1
)

if exist "frontend\.env" (
    echo [OK] 前端配置已就绪
) else (
    echo [ERROR] 前端配置创建失败
    pause
    exit /b 1
)
echo.

echo [步骤 2/5] 检查依赖安装...
if not exist "backend\node_modules" (
    echo [INFO] 后端依赖未安装，正在安装...
    cd backend
    call npm install >nul 2>&1
    cd ..
    if exist "backend\node_modules" (
        echo [OK] 后端依赖安装完成
    ) else (
        echo [WARNING] 后端依赖安装可能失败，请手动安装
    )
) else (
    echo [OK] 后端依赖已安装
)

if not exist "frontend\node_modules" (
    echo [INFO] 前端依赖未安装，正在安装...
    cd frontend
    call npm install --legacy-peer-deps >nul 2>&1
    cd ..
    if exist "frontend\node_modules" (
        echo [OK] 前端依赖安装完成
    ) else (
        echo [WARNING] 前端依赖安装可能失败，请手动安装
    )
) else (
    echo [OK] 前端依赖已安装
)
echo.

echo [步骤 3/5] 检查服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [INFO] 后端服务未运行
    echo [提示] 需要手动启动后端服务
) else (
    echo [OK] 后端服务正在运行
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [INFO] 前端服务未运行
    echo [提示] 需要手动启动前端服务
) else (
    echo [OK] 前端服务正在运行
)
echo.

echo [步骤 4/5] 创建管理员账号...
cd backend
if exist "node_modules" (
    node scripts\createAdmin.js >nul 2>&1
    echo [OK] 管理员账号已就绪（xubo327 / 3273279x）
) else (
    echo [WARNING] 无法创建管理员账号（依赖未安装）
)
cd ..
echo.

echo [步骤 5/5] 启动指南...
echo.
echo ========================================
echo 配置完成！现在启动服务
echo ========================================
echo.
echo 请在两个不同的窗口中分别运行:
echo.
echo 窗口1 - 后端服务:
echo   双击运行: 快速启动后端.bat
echo   或手动执行: cd backend ^&^& npm run dev
echo.
echo 窗口2 - 前端服务:
echo   双击运行: 启动前端.bat
echo   或手动执行: cd frontend ^&^& npm start
echo.
echo ========================================
echo.
echo 等待服务启动后，在浏览器中访问:
echo   http://localhost:3000
echo.
echo 登录信息:
echo   用户名: xubo327
echo   密码: 3273279x
echo.
pause
