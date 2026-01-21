@echo off
chcp 65001 >nul
echo ========================================
echo 启动前端服务
echo ========================================
echo.

echo [1/3] 检查前端依赖...
if not exist "frontend\node_modules" (
    echo [X] 前端依赖未安装
    echo 正在自动安装依赖，请稍候...
    echo 这可能需要几分钟，请耐心等待...
    echo.
    cd frontend
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] 依赖安装失败
        echo 请手动运行: cd frontend ^&^& npm install --legacy-peer-deps
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] 依赖安装完成
) else (
    if not exist "frontend\node_modules\.bin\react-scripts.cmd" (
        echo [!] react-scripts 未找到，重新安装依赖...
        cd frontend
        call npm install --legacy-peer-deps
        cd ..
    )
    echo [OK] 前端依赖已安装
)

echo.
echo [2/3] 检查并创建环境变量文件...
if not exist "frontend\.env" (
    echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
    echo [OK] frontend\.env 文件已创建
) else (
    echo [OK] frontend\.env 文件已存在
)

echo.
echo [3/3] 检查后端服务...
netstat -ano | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo [OK] 后端服务正在运行
) else (
    echo [!] 后端服务未运行
    echo 提示：请先启动后端服务 (cd backend ^&^& npm run dev)
    echo.
)

echo.
echo ========================================
echo 正在启动前端服务...
echo 前端地址: http://localhost:3000
echo 按 Ctrl+C 可以停止服务
echo ========================================
echo.
cd frontend
npm start
