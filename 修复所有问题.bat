@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 修复所有问题
echo ========================================
echo.

cd /d "%~dp0"

echo [修复 1/3] 创建后端 .env 文件...
if not exist "backend\.env" (
    echo [INFO] 正在创建 backend\.env 文件...
    echo.
    echo 使用默认配置（本地 MongoDB）
    echo 如需使用 MongoDB Atlas，请运行: 配置MongoDB Atlas.bat
    echo.
    
    REM 创建 .env 文件（使用简单的输出重定向避免特殊字符问题）
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_appid
        echo WECHAT_SECRET=your_secret
    ) > backend\.env
    
    echo [OK] backend\.env 文件已创建
    echo.
    echo 当前配置:
    type backend\.env
) else (
    echo [OK] backend\.env 文件已存在
    echo.
    echo 当前配置:
    type backend\.env
)
echo.

echo [修复 2/3] 确保前端 .env 文件正确...
cd frontend
if not exist ".env" (
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] frontend\.env 文件已创建
) else (
    findstr /C:"REACT_APP_API_URL" .env >nul 2>&1
    if !errorlevel! neq 0 (
        echo REACT_APP_API_URL=http://localhost:5000/api >> .env
        echo [OK] 已添加 REACT_APP_API_URL
    ) else (
        echo [OK] frontend\.env 配置正确
    )
)
echo 当前配置:
type .env
cd ..
echo.

echo [修复 3/3] 检查依赖安装...
echo.
echo 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo [WARNING] 后端依赖未安装
    echo 正在安装后端依赖...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] 后端依赖安装失败
    ) else (
        echo [OK] 后端依赖安装完成
    )
) else (
    echo [OK] 后端依赖已安装
)
cd ..

echo.
echo 检查前端依赖...
cd frontend
if not exist "node_modules" (
    echo [WARNING] 前端依赖未安装
    echo 正在安装前端依赖...
    call npm install --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo [ERROR] 前端依赖安装失败
    ) else (
        echo [OK] 前端依赖安装完成
    )
) else (
    echo [OK] 前端依赖已安装
)
cd ..
echo.

echo ========================================
echo 修复完成
echo ========================================
echo.
echo [下一步操作]
echo.
echo 1. 启动后端服务:
echo    双击运行: 快速启动后端.bat
echo    或手动执行: cd backend ^&^& npm run dev
echo.
echo 2. 启动前端服务（新窗口）:
echo    双击运行: 启动前端.bat
echo    或手动执行: cd frontend ^&^& npm start
echo.
echo 3. 创建管理员账号（如果需要）:
echo    双击运行: 创建管理员并测试登录.bat
echo.
echo ========================================
pause
