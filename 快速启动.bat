@echo off
chcp 65001 >nul
echo ====================================
echo 仓库管理系统 - 快速启动脚本
echo ====================================
echo.

echo [1/4] 检查环境变量文件...
if not exist "backend\.env" (
    echo 创建 backend\.env 文件...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > backend\.env
    echo backend\.env 已创建
)

if not exist "frontend\.env" (
    echo 创建 frontend\.env 文件...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > frontend\.env
    echo frontend\.env 已创建
)

echo.
echo [2/4] 安装后端依赖...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo 后端依赖已存在，跳过安装
)
cd ..

echo.
echo [3/4] 安装前端依赖...
cd frontend
if not exist "node_modules" (
    call npm install
) else (
    echo 前端依赖已存在，跳过安装
)
cd ..

echo.
echo [4/4] 启动项目...
echo 提示：将同时启动后端和前端服务
echo 后端地址: http://localhost:5000
echo 前端地址: http://localhost:3000
echo.
echo 按 Ctrl+C 可以停止服务
echo.

start "后端服务" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "前端服务" cmd /k "cd frontend && npm start"

echo.
echo 服务已启动！请在新的窗口中查看运行状态
echo.
pause
