@echo off
chcp 65001 >nul
echo ========================================
echo 检查后端文件结构
echo ========================================
echo.

set "backendPath=backend"
set "allExists=1"

echo 检查必需文件...
echo.

if exist "%backendPath%\server.js" (
    echo [✓] server.js - 服务器入口文件
) else (
    echo [✗] server.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\package.json" (
    echo [✓] package.json - 依赖配置文件
) else (
    echo [✗] package.json - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\auth.js" (
    echo [✓] routes/auth.js - 认证路由
) else (
    echo [✗] routes/auth.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\orders.js" (
    echo [✓] routes/orders.js - 订单路由
) else (
    echo [✗] routes/orders.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\batches.js" (
    echo [✓] routes/batches.js - 批次路由
) else (
    echo [✗] routes/batches.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\messages.js" (
    echo [✓] routes/messages.js - 消息路由
) else (
    echo [✗] routes/messages.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\users.js" (
    echo [✓] routes/users.js - 用户路由
) else (
    echo [✗] routes/users.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\routes\export.js" (
    echo [✓] routes/export.js - 导出路由
) else (
    echo [✗] routes/export.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\models\User.js" (
    echo [✓] models/User.js - 用户模型
) else (
    echo [✗] models/User.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\models\Order.js" (
    echo [✓] models/Order.js - 订单模型
) else (
    echo [✗] models/Order.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\models\Batch.js" (
    echo [✓] models/Batch.js - 批次模型
) else (
    echo [✗] models/Batch.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\models\Message.js" (
    echo [✓] models/Message.js - 消息模型
) else (
    echo [✗] models/Message.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\middleware\auth.js" (
    echo [✓] middleware/auth.js - 认证中间件
) else (
    echo [✗] middleware/auth.js - 缺失！
    set "allExists=0"
)

if exist "%backendPath%\.env" (
    echo [✓] .env - 环境变量文件
) else (
    echo [!] .env - 未创建，请运行 创建环境变量.bat
)

echo.
echo 检查依赖安装...
if exist "%backendPath%\node_modules" (
    echo [✓] node_modules - 已安装
) else (
    echo [!] node_modules - 未安装，请运行: cd backend ^&^& npm install
)

echo.
echo ========================================
if "%allExists%"=="1" (
    echo 所有必需文件都存在！
) else (
    echo 部分文件缺失，请检查！
)
echo ========================================
echo.
pause
